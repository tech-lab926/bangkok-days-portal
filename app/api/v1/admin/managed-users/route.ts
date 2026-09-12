import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { requirePermission } from '@/lib/permissions'
import { errors } from '@/lib/errors'
import { hashPassword } from '@/lib/password'
import { z } from 'zod'

const createUserSchema = z.object({
  loginId: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'EDITOR']).default('EDITOR'),
})

const updateUserSchema = z.object({
  loginId: z.string().min(1).optional().nullable(),
  name: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'EDITOR']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

// GET - List users (ADMIN and EDITOR roles only)
export async function GET(req: NextRequest) {
  try {
    await requirePermission("users", "canView")

    const users = await prisma.adminUser.findMany({
      where: {
        role: { in: ['ADMIN', 'EDITOR'] },
      },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return success(users)
  } catch (err) {
    return error(err)
  }
}

// POST - Create a new user (ADMIN or EDITOR)
export async function POST(req: NextRequest) {
  try {
    await requirePermission("users", "canCreate")

    const body = await req.json()
    const data = createUserSchema.parse(body)

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.adminUser.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })

    return success(user, 201)
  } catch (err) {
    return error(err)
  }
}

// PATCH - Update an existing user
export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("users", "canEdit")

    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('User ID required')

    // Ensure we can't edit SUPER_ADMIN users from this endpoint
    const target = await prisma.adminUser.findUnique({ where: { id } })
    if (!target) throw errors.notFound('User not found')
    if (target.role === 'SUPER_ADMIN') throw errors.forbidden()

    const body = await req.json()
    const { password, ...rest } = updateUserSchema.parse(body)

    const updateData: Record<string, unknown> = { ...rest }
    if (password) {
      updateData.password = await hashPassword(password)
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        active: true,
        updatedAt: true,
      },
    })

    return success(user)
  } catch (err) {
    return error(err)
  }
}

// DELETE - Remove a user
export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission("users", "canDelete")

    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('User ID required')

    // Cannot delete yourself
    if (id === session.user.id) throw errors.badRequest('自分自身は削除できません')

    // Ensure we can't delete SUPER_ADMIN users from this endpoint
    const target = await prisma.adminUser.findUnique({ where: { id } })
    if (!target) throw errors.notFound('User not found')
    if (target.role === 'SUPER_ADMIN') throw errors.forbidden()

    await prisma.adminUser.delete({ where: { id } })

    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
