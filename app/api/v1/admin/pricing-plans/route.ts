import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

export async function GET() {
  try {
    await requirePermission("pricing_plans", "canView")

    const plans = await prisma.pricingPlan.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { owners: true } },
      },
    })

    return success(plans)
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("pricing_plans", "canCreate")

    const body = await req.json()
    const { name, monthlyPrice, description, displayPriority } = body

    if (!name) throw errors.badRequest("プラン名は必須です")
    if (monthlyPrice === undefined || monthlyPrice === null) {
      throw errors.badRequest("月額料金は必須です")
    }

    const plan = await prisma.pricingPlan.create({
      data: {
        name,
        monthlyPrice: parseInt(monthlyPrice),
        description,
        displayPriority: displayPriority !== undefined ? parseInt(displayPriority) : 0,
      },
    })

    return success(plan, 201)
  } catch (err) {
    return error(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("pricing_plans", "canEdit")

    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) throw errors.badRequest("プランIDが必要です")

    const body = await req.json()
    const { name, monthlyPrice, description, enabled, displayPriority } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (monthlyPrice !== undefined) updateData.monthlyPrice = parseInt(monthlyPrice)
    if (description !== undefined) updateData.description = description
    if (enabled !== undefined) updateData.enabled = enabled
    if (displayPriority !== undefined) updateData.displayPriority = parseInt(displayPriority)

    const plan = await prisma.pricingPlan.update({
      where: { id },
      data: updateData,
    })

    // Cascade: update all stores (with no manual override) whose owner is on this plan
    if (updateData.displayPriority !== undefined) {
      await prisma.place.updateMany({
        where: {
          owner: { planId: id },
          displayPriority: { lt: 100 }, // don't overwrite manual high-value overrides
        },
        data: { displayPriority: updateData.displayPriority },
      })
    }

    return success(plan)
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("pricing_plans", "canDelete")

    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) throw errors.badRequest("プランIDが必要です")

    // Check if plan is in use
    const ownerCount = await prisma.owner.count({ where: { planId: id } })
    if (ownerCount > 0) {
      throw errors.badRequest(`このプランは${ownerCount}社で使用中のため削除できません`)
    }

    await prisma.pricingPlan.delete({ where: { id } })

    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
