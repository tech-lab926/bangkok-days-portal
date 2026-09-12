import type { MetadataRoute } from "next"

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://bangkok-days.com"

  try {
    const prisma = (await import("@/lib/prisma")).default
    const [places, areas, articles, categories] = await Promise.all([
      prisma.place.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }),
      prisma.area.findMany({ where: { enabled: true }, select: { slug: true, updatedAt: true } }),
      prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, type: true } }),
      prisma.category.findMany({ where: { enabled: true }, select: { slug: true, updatedAt: true } }),
    ])

    return [
      { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${base}/shops`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/area`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
      { url: `${base}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
      { url: `${base}/category`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
      { url: `${base}/jobs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
      ...places.map(p => ({ url: `${base}/shops/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...areas.map(a => ({ url: `${base}/area/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...articles.map(a => ({ url: `${base}/${a.type === "NEWS" ? "news" : "articles"}/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
      ...categories.map(c => ({ url: `${base}/category/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ]
  } catch {
    // fallback during build when DB is unavailable
    return [
      { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${base}/shops`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/area`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
      { url: `${base}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ]
  }
}
