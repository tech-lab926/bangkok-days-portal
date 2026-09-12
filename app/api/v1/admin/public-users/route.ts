import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { requirePermission } from '@/lib/permissions'
import { errors } from '@/lib/errors'
import { sendEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    await requirePermission("users", "canView")
    const { searchParams } = req.nextUrl
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'

    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status === 'frozen') where.frozen = true
    else if (status === 'deleted') where.deletedAt = { not: null }
    else if (status === 'normal') { where.frozen = false; where.deletedAt = null }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, email: true, fullName: true, nickname: true,
        emailVerified: true, active: true, frozen: true, deletedAt: true,
        lastLoginAt: true, createdAt: true, totalLikesReceived: true,
        _count: { select: { qaAnswers: true, qaQuestions: true } },
      },
      orderBy: sortBy === 'lastLoginAt' ? { lastLoginAt: 'desc' } : { createdAt: 'desc' },
    })

    return success(users)
  } catch (err) {
    return error(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("users", "canEdit")
    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('User ID required')

    const body = await req.json()
    const data: any = {}

    if (body.active !== undefined) data.active = body.active
    if (body.frozen !== undefined) {
      data.frozen = body.frozen
      data.active = !body.frozen  // freeze = deactivate login
    }

    // Edit profile fields
    if (body.nickname !== undefined) data.nickname = body.nickname || null
    if (body.email !== undefined) data.email = body.email
    if (body.fullName !== undefined) data.fullName = body.fullName
    if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl || null

    // Password reset — send email
    if (body.action === 'reset_password') {
      const user = await prisma.user.findUnique({ where: { id }, select: { email: true, fullName: true } })
      if (!user) throw errors.notFound('ユーザーが見つかりません')

      const token = `reset:${randomUUID()}`
      const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await prisma.user.update({ where: { id }, data: { verificationToken: token, tokenExpiresAt } })

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      await sendEmail({
        to: user.email,
        subject: '【バンコクデイズ】管理者によるパスワードリセット',
        text: `${user.fullName} 様\n\n管理者によりパスワードリセットが要求されました。\n以下のリンクからパスワードをリセットしてください（有効期限: 60分）\n\n${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`,
      })
      return success({ sent: true })
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, fullName: true, nickname: true, avatarUrl: true, active: true, frozen: true },
    })
    return success(user)
  } catch (err) {
    return error(err)
  }
}


export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("users", "canDelete")
    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('User ID required')

    // Soft delete — keep posts as anonymous
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), active: false, email: `deleted_${id}@deleted`, nickname: null, avatarUrl: null, bio: null },
    })
    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
