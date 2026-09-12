import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { generateAutoNews } from "@/lib/auto-news-generator"

// Extend serverless function timeout (Vercel: max 60s on hobby, 300s on pro)
export const maxDuration = 60

// POST: Trigger auto-news generation (from admin UI)
export async function POST(req: NextRequest) {
  try {
    await requirePermission("auto_news", "canCreate")

    const body = await req.json().catch(() => ({}))
    const autoPublish = body.autoPublish === true
    const dateFrom = body.dateFrom ? new Date(body.dateFrom) : null
    const dateTo = body.dateTo ? new Date(body.dateTo + "T23:59:59") : null

    const result = await generateAutoNews({ autoPublish, dateFrom, dateTo })

    return success(result)
  } catch (err) {
    console.error("[auto-news] Top-level error:", err)
    return error(err)
  }
}

// GET: List auto-generated news (for admin review)
export async function GET() {
  try {
    await requirePermission("auto_news", "canView")
    const { default: prisma } = await import("@/lib/prisma")
    const news = await prisma.article.findMany({
      where: { type: "NEWS", sourceUrl: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { translations: { where: { locale: "ja" } } },
    })
    return success(news)
  } catch (err) {
    return error(err)
  }
}
