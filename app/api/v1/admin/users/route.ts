import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { requirePermission } from '@/lib/permissions'
import { createAdminSchema, updateAdminSchema } from '@/lib/validations/auth'
import { hashPassword } from '@/lib/password'
import { errors } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requirePermission("admin_users", "canView")

    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        customRole: true,
        active: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return success(admins)
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("admin_users", "canCreate")

    const body = await req.json()
    const { customRole, password, loginId, ...rest } = createAdminSchema.parse(body)

    // Validate custom role exists if provided
    if (customRole) {
      const roleExists = await prisma.customRole.findUnique({ where: { code: customRole } })
      if (!roleExists) throw errors.badRequest(`ロール「${customRole}」が見つかりません`)
    }

    const hashedPassword = await hashPassword(password)

    const admin = await prisma.adminUser.create({
      data: {
        ...rest,
        password: hashedPassword,
        customRole: customRole ?? null,
        ...(loginId ? { loginId } : {}),
      },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        customRole: true,
        active: true,
        createdAt: true
      }
    })

    return success(admin, 201)
  } catch (err) {
    return error(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("admin_users", "canEdit")

    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('Admin ID required')

    const body = await req.json()
    const { password, customRole, email, ...rest } = updateAdminSchema.parse(body)

    const updateData: Record<string, unknown> = { ...rest }
    if (email) updateData.email = email
    if (password) {
      updateData.password = await hashPassword(password)
    }
    // Allow setting or clearing customRole
    if (customRole !== undefined) {
      updateData.customRole = customRole ?? null
    }

    const admin = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        customRole: true,
        active: true,
        updatedAt: true
      }
    })

    return success(admin)
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("admin_users", "canDelete")

    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('Admin ID required')

    await prisma.adminUser.delete({ where: { id } })

    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
