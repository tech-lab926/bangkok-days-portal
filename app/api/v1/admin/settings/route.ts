import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

export async function GET() {
  try {
    await requirePermission("settings", "canView")

    const settings = await prisma.globalSettings.findMany()
    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    return success(settingsMap)
  } catch (err) {
    return error(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("settings", "canEdit")

    const body = await req.json()

    for (const [key, value] of Object.entries(body)) {
      await prisma.globalSettings.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    }

    return success({ updated: true })
  } catch (err) {
    return error(err)
  }
}
