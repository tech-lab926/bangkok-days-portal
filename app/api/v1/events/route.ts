import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { errors } from "@/lib/errors"

export async function GET() {
  try {
    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 86400000)
    const events = await prisma.todayEvent.findMany({
      where: {
        active: true,
        eventDate: {
          gte: new Date(now.toISOString().slice(0, 10)),
          lte: new Date(in7Days.toISOString().slice(0, 10)),
        },
      },
      orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
    })
    return success(events)
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw errors.unauthorized()

    const { title, eventTime, area, eventDate, description, imageUrls, contactUrl, lineId, contactEmail, contactPhone } = await req.json()
    if (!title || !eventTime || !area || !eventDate) {
      throw errors.badRequest("タイトル・時間・エリア・日付は必須です")
    }

    const event = await prisma.todayEvent.create({
      data: {
        title,
        eventTime,
        area,
        eventDate: new Date(eventDate),
        description: description || null,
        imageUrls: imageUrls || [],
        submittedBy: session.user.id,
        active: false,
        contactUrl: contactUrl || null,
        lineId: lineId || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
      },
    })
    return success(event, 201)
  } catch (err) {
    return error(err)
  }
}
