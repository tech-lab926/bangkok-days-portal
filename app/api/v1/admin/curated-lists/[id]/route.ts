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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("curated_lists", "canView")
    const { id } = await params
    const list = await prisma.curatedList.findUnique({ where: { id }, include })
    if (!list) throw errors.notFound("キュレーションリスト")
    return success(list)
  } catch (err) {
    return error(err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("curated_lists", "canEdit")
    const { id } = await params
    const { title, slug, description, seoTitle, seoDescription, coverUrl, published, placeIds } = await req.json()

    await prisma.curatedList.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
        ...(seoDescription !== undefined && { seoDescription: seoDescription || null }),
        ...(coverUrl !== undefined && { coverUrl: coverUrl || null }),
        ...(published !== undefined && { published }),
      },
    })

    if (placeIds !== undefined) {
      await prisma.curatedListPlace.deleteMany({ where: { curatedListId: id } })
      if (placeIds.length > 0) {
        await prisma.curatedListPlace.createMany({
          data: placeIds.map((pid: string, i: number) => ({ curatedListId: id, placeId: pid, order: i })),
        })
      }
    }

    const list = await prisma.curatedList.findUnique({ where: { id }, include })
    return success(list)
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("curated_lists", "canDelete")
    const { id } = await params
    await prisma.curatedList.delete({ where: { id } })
    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
