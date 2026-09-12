import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

export async function GET() {
  try {
    await requirePermission("stores", "canView")
    const stations = await prisma.station.findMany({ orderBy: [{ line: "asc" }, { displayOrder: "asc" }] })
    return success(stations)
  } catch (err) { return error(err) }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("stores", "canCreate")
    const { name, line, displayOrder } = await req.json()
    if (!name) throw errors.badRequest("駅名は必須です")
    const station = await prisma.station.create({ data: { name, line: line || null, displayOrder: displayOrder ?? 0 } })
    return success(station, 201)
  } catch (err) { return error(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("stores", "canEdit")
    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) throw errors.badRequest("ID required")
    const body = await req.json()
    const station = await prisma.station.update({ where: { id }, data: body })
    return success(station)
  } catch (err) { return error(err) }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("stores", "canDelete")
    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) throw errors.badRequest("ID required")
    await prisma.station.delete({ where: { id } })
    return success({ deleted: true })
  } catch (err) { return error(err) }
}
