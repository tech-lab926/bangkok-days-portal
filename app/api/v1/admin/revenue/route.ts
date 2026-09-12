import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

export async function GET(req: NextRequest) {
  try {
    await requirePermission("revenue", "canView")

    const { searchParams } = req.nextUrl
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString())

    const billings = await prisma.monthlyBilling.findMany({
      where: { year, month },
      orderBy: { owner: { companyName: "asc" } },
      include: {
        owner: {
          include: {
            plan: true,
            _count: { select: { places: true } },
          },
        },
        stores: {
          include: {
            place: {
              include: {
                translations: { where: { locale: "ja" } },
              },
            },
            plan: true,
          },
        },
      },
    })

    // Get closing date
    const closingDaySetting = await prisma.globalSettings.findUnique({
      where: { key: "billing_closing_day" },
    })
    const closingDay = closingDaySetting ? parseInt(closingDaySetting.value) : 25

    return success({ billings, closingDay, year, month })
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("revenue", "canCreate")

    const body = await req.json()
    const { year, month } = body

    if (!year || !month) throw errors.badRequest("年月が必要です")

    // Get all active owners with their places and plans
    const owners = await prisma.owner.findMany({
      where: { active: true },
      include: {
        plan: true,
        places: {
          where: { isVisible: true },
          include: {
            translations: { where: { locale: "ja" } },
          },
        },
      },
    })

    // Create or update monthly billings
    for (const owner of owners) {
      if (owner.places.length === 0) continue

      const billing = await prisma.monthlyBilling.upsert({
        where: {
          ownerId_year_month: { ownerId: owner.id, year, month },
        },
        create: {
          ownerId: owner.id,
          year,
          month,
          totalAmount: 0,
          stores: {
            create: owner.places.map((place) => ({
              placeId: place.id,
              planId: owner.planId,
              amount: owner.plan?.monthlyPrice || 0,
              active: true,
            })),
          },
        },
        update: {},
      })

      // Recalculate total
      const stores = await prisma.storeBilling.findMany({
        where: { monthlyBillingId: billing.id, active: true },
      })
      const total = stores.reduce((sum, s) => sum + s.amount, 0)
      await prisma.monthlyBilling.update({
        where: { id: billing.id },
        data: { totalAmount: total },
      })
    }

    return success({ generated: true })
  } catch (err) {
    return error(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("revenue", "canEdit")

    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) throw errors.badRequest("請求IDが必要です")

    const body = await req.json()
    const { status } = body

    if (!status) throw errors.badRequest("ステータスが必要です")

    const billing = await prisma.monthlyBilling.update({
      where: { id },
      data: { status },
    })

    return success(billing)
  } catch (err) {
    return error(err)
  }
}
