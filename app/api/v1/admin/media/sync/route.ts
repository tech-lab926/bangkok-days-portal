import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"

function basenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const base = pathname.split("/").pop() || "unknown"
    return decodeURIComponent(base)
  } catch {
    return "unknown"
  }
}

export async function POST() {
  try {
    await requirePermission("media", "canCreate")

    // 1. Collect all image URLs from every image-holding table
    const [
      placeImages,
      areas,
      categories,
      articleTranslations,
      jobs,
      curatedLists,
      todayEvents,
    ] = await Promise.all([
      prisma.placeImage.findMany({ select: { url: true } }),
      prisma.area.findMany({ select: { imageUrl: true } }),
      prisma.category.findMany({ select: { imageUrl: true } }),
      prisma.articleTranslation.findMany({ select: { coverUrl: true } }),
      prisma.job.findMany({ select: { imageUrl: true } }),
      prisma.curatedList.findMany({ select: { coverUrl: true } }),
      prisma.todayEvent.findMany({ select: { imageUrls: true } }),
    ])

    const urlSet = new Set<string>()

    for (const pi of placeImages) urlSet.add(pi.url)
    for (const a of areas) if (a.imageUrl) urlSet.add(a.imageUrl)
    for (const c of categories) if (c.imageUrl) urlSet.add(c.imageUrl)
    for (const at of articleTranslations) if (at.coverUrl) urlSet.add(at.coverUrl)
    for (const j of jobs) if (j.imageUrl) urlSet.add(j.imageUrl)
    for (const cl of curatedLists) if (cl.coverUrl) urlSet.add(cl.coverUrl)
    for (const te of todayEvents) {
      for (const url of te.imageUrls) urlSet.add(url)
    }

    const allUrls = Array.from(urlSet).filter((url) => url.startsWith("http"))

    // 2. Find which URLs are already in Media
    const existing = await prisma.media.findMany({
      where: { url: { in: allUrls } },
      select: { url: true },
    })
    const existingSet = new Set(existing.map((m) => m.url))

    // 3. Create missing Media records
    const missingUrls = allUrls.filter((url) => !existingSet.has(url))
    const created: string[] = []
    const failed: string[] = []

    for (const url of missingUrls) {
      try {
        // Try to get file size from Cloudinary URL by fetching headers
        let size = 0
        try {
          const head = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000) })
          const contentLength = head.headers.get("content-length")
          if (contentLength) size = parseInt(contentLength)
        } catch { /* size stays 0 if unreachable */ }

        await prisma.media.create({
          data: {
            url,
            filename: basenameFromUrl(url),
            mimeType: "image/jpeg",
            size,
          },
        })
        created.push(url)
      } catch (err) {
        console.error("[media/sync] Failed to create media for", url, err)
        failed.push(url)
      }
    }

    // 4. Backfill size=0 records using Cloudinary Admin API
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    const zeroSize = await prisma.media.findMany({
      where: { size: 0 },
      select: { id: true, url: true, publicId: true },
    })
    let backfilled = 0

    await Promise.all(
      zeroSize.map(async (m) => {
        try {
          let size = 0

          // Try Cloudinary Admin API if we have credentials and a publicId
          if (cloudName && apiKey && apiSecret) {
            const pubId = m.publicId || (() => {
              // Extract publicId from Cloudinary URL: .../upload/v123/folder/filename.ext
              const match = m.url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
              return match?.[1] || null
            })()

            if (pubId) {
              const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")
              const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${pubId}`,
                { headers: { Authorization: `Basic ${auth}` }, signal: AbortSignal.timeout(5000) }
              )
              if (res.ok) {
                const data = await res.json()
                size = data.bytes || 0
              }
            }
          }

          // Fallback: HEAD request
          if (!size) {
            const head = await fetch(m.url, { method: "HEAD", signal: AbortSignal.timeout(5000) })
            const cl = head.headers.get("content-length")
            if (cl) size = parseInt(cl)
          }

          if (size > 0) {
            await prisma.media.update({ where: { id: m.id }, data: { size } })
            backfilled++
          }
        } catch { /* skip */ }
      })
    )

    return success({
      scanned: allUrls.length,
      existing: existing.length,
      created: created.length,
      failed: failed.length,
      backfilled,
    })
  } catch (err) {
    return error(err)
  }
}
