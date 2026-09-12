import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { errors } from "@/lib/errors"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const event = await prisma.todayEvent.findUnique({ where: { id } })
    if (!event || !event.active) throw errors.notFound("イベント")
    return success(event)
  } catch (err) {
    return error(err)
  }
}
