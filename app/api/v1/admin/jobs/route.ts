import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

export async function GET() {
  try {
    await requirePermission("jobs", "canView")
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        place: { include: { translations: { where: { locale: "ja" } } } },
      },
    })
    return success(jobs)
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("jobs", "canCreate")
    const { company, title, category, location, description, placeId, imageUrl } = await req.json()
    if (!company || !title) throw errors.badRequest("会社名と求人タイトルは必須です")
    const job = await prisma.job.create({
      data: { company, title, category: category || "", location: location || "", description, placeId: placeId || null, imageUrl: imageUrl || null },
      include: { place: { include: { translations: { where: { locale: "ja" } } } } },
    })
    revalidatePath("/", "page")
    return success(job, 201)
  } catch (err) {
    return error(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("jobs", "canEdit")
    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) throw errors.badRequest("IDが必要です")
    const body = await req.json()
    const data: any = {}
    if (body.company !== undefined) data.company = body.company
    if (body.title !== undefined) data.title = body.title
    if (body.category !== undefined) data.category = body.category
    if (body.location !== undefined) data.location = body.location
    if (body.description !== undefined) data.description = body.description
    if (body.placeId !== undefined) data.placeId = body.placeId || null
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null
    if (body.active !== undefined) data.active = body.active
    const job = await prisma.job.update({
      where: { id },
      data,
      include: { place: { include: { translations: { where: { locale: "ja" } } } } },
    })
    revalidatePath("/", "page")
    return success(job)
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("jobs", "canDelete")
    const id = req.nextUrl.searchParams.get("id")
    if (!id) throw errors.badRequest("IDが必要です")
    await prisma.job.delete({ where: { id } })
    revalidatePath("/", "page")
    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
