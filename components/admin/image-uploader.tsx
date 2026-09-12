"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ImageCropper } from "./image-cropper"

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [cropFileName, setCropFileName] = useState<string>("image.jpg")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCropImageSrc(reader.result as string)
      setCropFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedFile: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", croppedFile, cropFileName)

      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      onChange(json.data.url)
      toast.success("画像をアップロードしました")
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "画像のアップロードに失敗しました"
      toast.error(message)
    } finally {
      setUploading(false)
      setCropImageSrc(null)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      {/* Show current thumbnail preview if a value is already set */}
      {value && (
        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="サムネイル画像"
            className="h-28 w-full max-w-xs rounded-md border object-cover"
          />
          <p className="mt-1 text-[12px] text-muted-foreground break-all">{value}</p>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="max-w-xs"
        />
        {uploading && (
          <span className="text-sm text-muted-foreground">
            アップロード中...
          </span>
        )}
      </div>

      <ImageCropper
        open={!!cropImageSrc}
        onClose={() => {
          setCropImageSrc(null)
          if (inputRef.current) inputRef.current.value = ""
        }}
        imageSrc={cropImageSrc || ""}
        onCropComplete={handleCropComplete}
      />
    </>
  )
}
