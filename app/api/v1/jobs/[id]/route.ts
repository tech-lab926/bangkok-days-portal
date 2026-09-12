import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { errors } from "@/lib/errors"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const job = await prisma.job.findUnique({
      where: { id },
      include: { place: { include: { translations: { where: { locale: "ja" } } } } },
    })
    if (!job || !job.active) throw errors.notFound("求人")
    return success(job)
  } catch (err) {
    return error(err)
  }
}
