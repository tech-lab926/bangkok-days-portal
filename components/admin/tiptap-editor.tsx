"use client"

import { useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import {
  Bold, Italic, Underline, Strikethrough,
  Heading3, Heading4, Heading5,
  List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Link2, ImageIcon,
} from "lucide-react"
import { toast } from "sonner"

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const imgInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImg, setUploadingImg] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [3, 4, 5] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string) => (
    <Button
      type="button" variant="ghost" size="icon" title={title}
      onClick={onClick}
      className={`h-8 w-8 ${active ? "bg-muted" : ""}`}
    >
      {icon}
    </Button>
  )

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImg(true)
      const formData = new FormData()
      formData.append("file", file, file.name)

      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      editor.chain().focus().setImage({ src: json.data.url, alt: file.name }).run()
      toast.success("画像を挿入しました")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "画像のアップロードに失敗しました"
      toast.error(message)
    } finally {
      setUploadingImg(false)
      if (imgInputRef.current) imgInputRef.current.value = ""
    }
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/50">
        {/* History */}
        {btn(false, () => editor.chain().focus().undo().run(), <Undo className="h-4 w-4" />, "元に戻す")}
        {btn(false, () => editor.chain().focus().redo().run(), <Redo className="h-4 w-4" />, "やり直す")}
        <div className="w-px bg-border mx-1" />

        {/* Headings */}
        {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 className="h-4 w-4" />, "見出し3")}
        {btn(editor.isActive("heading", { level: 4 }), () => editor.chain().focus().toggleHeading({ level: 4 }).run(), <Heading4 className="h-4 w-4" />, "見出し4")}
        {btn(editor.isActive("heading", { level: 5 }), () => editor.chain().focus().toggleHeading({ level: 5 }).run(), <Heading5 className="h-4 w-4" />, "見出し5")}
        <div className="w-px bg-border mx-1" />

        {/* Inline */}
        {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold className="h-4 w-4" />, "太字")}
        {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic className="h-4 w-4" />, "斜体")}
        {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <Underline className="h-4 w-4" />, "下線")}
        {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <Strikethrough className="h-4 w-4" />, "取り消し線")}
        {btn(editor.isActive("link"), () => {
          if (editor.isActive("link")) editor.chain().focus().unsetLink().run()
        }, <Link2 className="h-4 w-4" />, "リンク解除")}
        <div className="w-px bg-border mx-1" />

        {/* Align */}
        {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), <AlignLeft className="h-4 w-4" />, "左揃え")}
        {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), <AlignCenter className="h-4 w-4" />, "中央揃え")}
        {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), <AlignRight className="h-4 w-4" />, "右揃え")}
        <div className="w-px bg-border mx-1" />

        {/* Lists */}
        {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List className="h-4 w-4" />, "箇条書き")}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-4 w-4" />, "番号付きリスト")}
        {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="h-4 w-4" />, "引用")}
        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), <Minus className="h-4 w-4" />, "区切り線")}
        <div className="w-px bg-border mx-1" />

        {/* Image upload button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="画像を挿入"
          disabled={uploadingImg}
          onClick={() => imgInputRef.current?.click()}
          className="h-8 w-8"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        {uploadingImg && <span className="text-xs text-muted-foreground self-center px-1">アップロード中...</span>}
        <div className="w-px bg-border mx-1" />

        {/* Color palette */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground">色:</span>
          {["#000000","#e53e3e","#dd6b20","#d69e2e","#38a169","#3182ce","#805ad5","#d53f8c","#718096","#ffffff"].map(color => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="h-5 w-5 rounded border border-gray-300 hover:scale-110 transition"
              style={{ backgroundColor: color }}
            />
          ))}
          <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className="text-xs text-muted-foreground hover:text-foreground px-1">リセット</button>
        </div>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[400px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gray-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:my-4 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_img]:my-3"
      />
    </div>
  )
}
