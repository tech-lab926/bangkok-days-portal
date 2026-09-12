import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

const include = {
  places: {
    orderBy: { order: "asc" as const },
    include: {
      place: {
        include: {
          translations: { where: { locale: "ja" } },
          images: { orderBy: { order: "asc" as const }, take: 1 },
          area: { include: { translations: { where: { locale: "ja" } } } },
        },
      },
    },
  },
}

export async function GET() {
  try {
    await requirePermission("curated_lists", "canView")
    const lists = await prisma.curatedList.findMany({
      orderBy: { displayOrder: "asc" },
      include,
    })
    return success(lists)
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("curated_lists", "canCreate")
    const { title, slug, description, seoTitle, seoDescription, coverUrl, published, placeIds } = await req.json()
    if (!title || !slug) throw errors.badRequest("タイトルとスラッグは必須です")

    const list = await prisma.curatedList.create({
      data: {
        title, slug,
        description: description || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        coverUrl: coverUrl || null,
        published: published ?? false,
        places: {
          create: (placeIds || []).map((id: string, i: number) => ({ placeId: id, order: i })),
        },
      },
      include,
    })
    return success(list, 201)
  } catch (err) {
    return error(err)
  }
}
