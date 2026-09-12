import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error, paginated } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { requireAuth } from "@/lib/auth"
import { errors } from "@/lib/errors"

export async function GET(req: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))
    const search = searchParams.get("search") || ""

    const where: any = {}
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
      ]
    }

    const [owners, total] = await Promise.all([
      prisma.owner.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          plan: true,
          _count: { select: { places: true } },
        },
      }),
      prisma.owner.count({ where }),
    ])

    return paginated(owners, total, page, limit)
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("owners", "canCreate")

    const body = await req.json()
    const { companyName, contactName, phone, email, planId, memo } = body

    if (!companyName) throw errors.badRequest("会社名は必須です")
    if (!contactName) throw errors.badRequest("担当者名は必須です")
    if (!phone) throw errors.badRequest("電話番号は必須です")
    if (!email) throw errors.badRequest("メールは必須です")

    const owner = await prisma.owner.create({
      data: {
        companyName,
        contactName,
        phone,
        email,
        memo,
        planId: planId || null,
      },
      include: { plan: true },
    })

    return success(owner, 201)
  } catch (err) {
    return error(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("owners", "canEdit")

    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) throw errors.badRequest("オーナーIDが必要です")

    const body = await req.json()
    const { companyName, contactName, phone, email, planId, memo, active } = body

    const updateData: any = {}
    if (companyName !== undefined) updateData.companyName = companyName
    if (contactName !== undefined) updateData.contactName = contactName
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (planId !== undefined) updateData.planId = planId || null
    if (memo !== undefined) updateData.memo = memo
    if (active !== undefined) updateData.active = active

    const owner = await prisma.owner.update({
      where: { id },
      data: updateData,
      include: {
        plan: true,
        _count: { select: { places: true } },
      },
    })

    return success(owner)
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("owners", "canDelete")

    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    if (!id) throw errors.badRequest("オーナーIDが必要です")

    const owner = await prisma.owner.findUnique({
      where: { id },
      include: { _count: { select: { places: true } } },
    })
    if (!owner) throw errors.notFound("オーナーが見つかりません")
    if (owner._count.places > 0) {
      throw errors.badRequest(`このオーナーには${owner._count.places}件の店舗が紐付いています。先に店舗のオーナーを変更してください。`)
    }

    // Delete monthly billings (no cascade on Owner relation)
    await prisma.monthlyBilling.deleteMany({ where: { ownerId: id } })
    await prisma.owner.delete({ where: { id } })
    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
