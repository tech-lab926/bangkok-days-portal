import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { createHash } from "crypto"

async function deleteFromCloudinary(publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return

  const timestamp = Math.round(Date.now() / 1000)
  const signature = createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex")

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_id: publicId, api_key: apiKey, timestamp, signature }),
  })
}

type Usage = {
  type: "place" | "area" | "category" | "article" | "job" | "curated-list" | "today-event"
  name: string
  detail?: string
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission("media", "canView")
    const { searchParams } = req.nextUrl
    const search = searchParams.get("search") || ""
    const area = searchParams.get("area") || ""
    const store = searchParams.get("store") || ""
    const usage = searchParams.get("usage") || "all"
    const contentType = searchParams.get("contentType") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 24

    // 1. Fetch all media matching filename search (no pagination yet)
    const where: { filename?: { contains: string; mode: "insensitive" } } = {}
    if (search) where.filename = { contains: search, mode: "insensitive" }

    const allMedia = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: { id: true, url: true, filename: true, size: true, createdAt: true, publicId: true },
    })

    const urls = allMedia.map((m) => m.url)

    // 2. Cross-reference with all image-holding tables in parallel
    const [placeImages, areas, categories, articleTranslations, jobs, curatedLists, todayEvents] =
      await Promise.all([
        // Place images
        prisma.placeImage.findMany({
          where: { url: { in: urls } },
          include: {
            place: {
              include: {
                translations: { where: { locale: "ja" }, select: { name: true } },
                area: {
                  include: {
                    translations: { where: { locale: "ja" }, select: { name: true } },
                  },
                },
              },
            },
          },
        }),
        // Area images
        prisma.area.findMany({
          where: { imageUrl: { in: urls } },
          include: {
            translations: { where: { locale: "ja" }, select: { name: true } },
          },
        }),
        // Category images
        prisma.category.findMany({
          where: { imageUrl: { in: urls } },
          include: {
            translations: { where: { locale: "ja" }, select: { name: true } },
          },
        }),
        // Article covers
        prisma.articleTranslation.findMany({
          where: { coverUrl: { in: urls }, locale: "ja" },
          include: {
            article: { select: { type: true } },
          },
        }),
        // Job images
        prisma.job.findMany({
          where: { imageUrl: { in: urls } },
          select: { imageUrl: true, title: true, company: true },
        }),
        // Curated list covers
        prisma.curatedList.findMany({
          where: { coverUrl: { in: urls } },
          select: { coverUrl: true, title: true },
        }),
        // Today event images
        prisma.todayEvent.findMany({
          where: { imageUrls: { hasSome: urls } },
          select: { imageUrls: true, title: true },
        }),
      ])

    // 3. Build usage map
    const urlToUsages = new Map<string, Usage[]>()

    for (const pi of placeImages) {
      const list = urlToUsages.get(pi.url) || []
      list.push({
        type: "place",
        name: pi.place.translations[0]?.name || pi.place.slug,
        detail: pi.place.area?.translations[0]?.name || "",
      })
      urlToUsages.set(pi.url, list)
    }

    for (const a of areas) {
      if (!a.imageUrl) continue
      const list = urlToUsages.get(a.imageUrl) || []
      list.push({
        type: "area",
        name: a.translations[0]?.name || a.slug,
      })
      urlToUsages.set(a.imageUrl, list)
    }

    for (const c of categories) {
      if (!c.imageUrl) continue
      const list = urlToUsages.get(c.imageUrl) || []
      list.push({
        type: "category",
        name: c.translations[0]?.name || c.slug,
      })
      urlToUsages.set(c.imageUrl, list)
    }

    for (const at of articleTranslations) {
      if (!at.coverUrl) continue
      const list = urlToUsages.get(at.coverUrl) || []
      list.push({
        type: "article",
        name: at.title,
        detail: at.article.type,
      })
      urlToUsages.set(at.coverUrl, list)
    }

    for (const j of jobs) {
      if (!j.imageUrl) continue
      const list = urlToUsages.get(j.imageUrl) || []
      list.push({
        type: "job",
        name: j.title,
        detail: j.company,
      })
      urlToUsages.set(j.imageUrl, list)
    }

    for (const cl of curatedLists) {
      if (!cl.coverUrl) continue
      const list = urlToUsages.get(cl.coverUrl) || []
      list.push({
        type: "curated-list",
        name: cl.title,
      })
      urlToUsages.set(cl.coverUrl, list)
    }

    for (const te of todayEvents) {
      for (const url of te.imageUrls) {
        if (!urls.includes(url)) continue
        const list = urlToUsages.get(url) || []
        list.push({
          type: "today-event",
          name: te.title,
        })
        urlToUsages.set(url, list)
      }
    }

    // 4. Enrich and filter
    let enriched = allMedia.map((m) => ({
      ...m,
      usages: urlToUsages.get(m.url) || [],
      storeName:
        urlToUsages
          .get(m.url)
          ?.find((u) => u.type === "place")
          ?.name || null,
      areaName:
        urlToUsages
          .get(m.url)
          ?.find((u) => u.type === "place")
          ?.detail ||
        urlToUsages
          .get(m.url)
          ?.find((u) => u.type === "area")
          ?.name ||
        null,
    }))

    if (usage === "used") enriched = enriched.filter((m) => m.usages.length > 0)
    if (usage === "unused") enriched = enriched.filter((m) => m.usages.length === 0)

    if (contentType) {
      enriched = enriched.filter((m) => m.usages.some((u) => u.type === contentType))
    }

    if (store) {
      enriched = enriched.filter((m) =>
        m.usages.some((u) => u.type === "place" && u.name.toLowerCase().includes(store.toLowerCase()))
      )
    }

    if (area) {
      enriched = enriched.filter((m) =>
        m.usages.some(
          (u) =>
            (u.type === "place" && u.detail?.toLowerCase().includes(area.toLowerCase())) ||
            (u.type === "area" && u.name.toLowerCase().includes(area.toLowerCase()))
        )
      )
    }

    // 5. Paginate
    const total = enriched.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const safePage = Math.min(page, totalPages)
    const paginated = enriched.slice((safePage - 1) * limit, safePage * limit)

    return success({
      items: paginated,
      total,
      page: safePage,
      totalPages,
    })
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("media", "canDelete")
    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) return error(new Error("IDが必要です"))

    const items = await prisma.media.findMany({ where: { id: { in: ids } } })

    // Delete from Cloudinary
    await Promise.all(items.filter((i) => i.publicId).map((i) => deleteFromCloudinary(i.publicId!)))

    // Delete from DB
    await prisma.media.deleteMany({ where: { id: { in: ids } } })

    return success({ deleted: ids.length })
  } catch (err) {
    return error(err)
  }
}
