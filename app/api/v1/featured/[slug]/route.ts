import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { errors } from "@/lib/errors"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const list = await prisma.curatedList.findUnique({
      where: { slug, published: true },
      include: {
        places: {
          orderBy: { order: "asc" },
          include: {
            place: {
              include: {
                translations: { where: { locale: "ja" } },
                images: { orderBy: { order: "asc" }, take: 1 },
                area: { include: { translations: { where: { locale: "ja" } } } },
                categories: { include: { category: { include: { translations: { where: { locale: "ja" } } } } } },
              },
            },
          },
        },
      },
    })
    if (!list) throw errors.notFound("特集ページ")
    return success(list)
  } catch (err) {
    return error(err)
  }
}
