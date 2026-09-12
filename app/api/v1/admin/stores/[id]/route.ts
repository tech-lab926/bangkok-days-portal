import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("stores", "canView")
    const { id } = await params

    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        translations: true,
        area: { include: { translations: true } },
        owner: true,
        categories: {
          include: { category: { include: { translations: true } } },
        },
        scenes: {
          include: { scene: { include: { translations: true } } },
        },
        images: { orderBy: { order: "asc" } },
        tags: { include: { tag: { include: { translations: true } } } },
        storeBillings: true,
      },
    })

    if (!place) throw errors.notFound("店舗")

    return success(place)
  } catch (err) {
    return error(err)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("stores", "canEdit")
    const { id } = await params
    const body = await req.json()

    // Toggle visibility
    if (body.isVisible !== undefined) {
      const place = await prisma.place.update({
        where: { id },
        data: { isVisible: body.isVisible },
      })
      return success(place)
    }

    return success({ id })
  } catch (err) {
    return error(err)
  }
}
