import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

export async function GET() {
  try {
    await requirePermission("featured", "canView")

    const pages = await prisma.featuredPage.findMany({
      orderBy: { displayOrder: "asc" },
    })

    return success(pages)
  } catch (err) {
    return error(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("featured", "canEdit")

    const body = await req.json()

    if (Array.isArray(body)) {
      // Delete existing, recreate
      await prisma.featuredPage.deleteMany({})

      if (body.length > 5) {
        throw errors.badRequest("最大5件までです")
      }

      for (const item of body) {
        await prisma.featuredPage.create({
          data: {
            id: item.id || undefined,
            title: item.title,
            url: item.url,
            displayOrder: item.displayOrder,
            enabled: item.enabled ?? true,
          },
        })
      }

      return success({ updated: true })
    }

    throw errors.badRequest("配列形式で送信してください")
  } catch (err) {
    return error(err)
  }
}
