"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import ReactCrop, {
  type Crop,
  type PixelCrop,
} from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ImageCropperProps {
  open: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedFile: File) => void
}

function getCroppedImg(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No 2d context")

  // Scale factor: natural image size vs displayed size
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  const cropX = pixelCrop.x * scaleX
  const cropY = pixelCrop.y * scaleY
  const cropW = pixelCrop.width * scaleX
  const cropH = pixelCrop.height * scaleY

  canvas.width = cropW
  canvas.height = cropH

  ctx.drawImage(
    image,
    cropX, cropY, cropW, cropH,
    0, 0, cropW, cropH,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Canvas is empty"))
    }, "image/jpeg", 0.92)
  })
}

function makeInitialCrop(): Crop {
  return {
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  }
}

export function ImageCropper({
  open,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>(makeInitialCrop())
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Reset state when a new image is opened
  useEffect(() => {
    if (open && imageSrc) {
      setCrop(makeInitialCrop())
      setCompletedCrop(null)
      setImgLoaded(false)
    }
  }, [open, imageSrc])

  const onImageLoad = useCallback(
    () => {
      setImgLoaded(true)
      // Set an initial crop that covers most of the image
      setCrop({
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      })
    },
    [],
  )

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current || !imgLoaded) return
    try {
      setIsProcessing(true)
      const blob = await getCroppedImg(imgRef.current, completedCrop)
      const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" })
      onCropComplete(file)
      onClose()
    } catch (err) {
      console.error("Crop failed:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>画像の表示範囲を調整</DialogTitle>
          <p className="text-sm text-muted-foreground">
            枠をドラッグで移動、四隅のハンドルで自由にサイズ変更できます
          </p>
        </DialogHeader>

        <div className="flex justify-center px-6 py-4 min-h-[200px]">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              minWidth={50}
              minHeight={50}
              ruleOfThirds
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-[50vh] max-w-full object-contain"
                style={{ display: "block" }}
              />
            </ReactCrop>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isProcessing || !completedCrop || !imgLoaded}
          >
            {isProcessing ? "処理中..." : "この範囲でアップロード"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
