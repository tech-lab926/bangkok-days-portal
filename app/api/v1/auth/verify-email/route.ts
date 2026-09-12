import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { errors } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      throw errors.badRequest('トークンが必要です')
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    })

    if (!user) {
      throw errors.badRequest('無効なトークンです')
    }

    if (user.emailVerified) {
      return success({ message: 'メールアドレスは既に確認済みです', alreadyVerified: true })
    }

    if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
      throw errors.badRequest('トークンの有効期限が切れています。再送信してください。')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
      },
    })

    return success({
      message: 'メールアドレスが確認されました',
      verified: true,
      email: user.email,
    })
  } catch (err) {
    return error(err)
  }
}
