import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requirePermission } from "@/lib/permissions"

export async function POST(req: NextRequest) {
  try {
    await requirePermission("media", "canCreate")
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ success: false, error: "Cloudinary not configured" }, { status: 500 })
    }

    const timestamp = Math.round(Date.now() / 1000)
    const folder = "site-bang"

    const { createHash } = await import("crypto")
    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex")

    const uploadForm = new FormData()
    uploadForm.append("file", file)
    uploadForm.append("api_key", apiKey)
    uploadForm.append("timestamp", timestamp.toString())
    uploadForm.append("signature", signature)
    uploadForm.append("folder", folder)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadForm }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.error?.message || "Upload failed" }, { status: 400 })
    }

    // Save to Media table
    try {
      await prisma.media.create({
        data: {
          url: data.secure_url,
          filename: file.name,
          mimeType: file.type || "image/jpeg",
          size: file.size,
          publicId: data.public_id,
        },
      })
    } catch (mediaErr) {
      console.error("[upload] Failed to save media record:", mediaErr)
    }

    return NextResponse.json({ success: true, data: { url: data.secure_url, publicId: data.public_id } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 })
  }
}
