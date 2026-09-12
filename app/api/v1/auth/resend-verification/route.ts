import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { resendVerificationSchema } from '@/lib/validations/user'
import { sendVerificationEmail } from '@/lib/email'
import { success, error } from '@/lib/api-response'
import { errors } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resendVerificationSchema.safeParse(body)

    if (!parsed.success) {
      throw errors.badRequest('有効なメールアドレスを入力してください')
    }

    const email = parsed.data.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.emailVerified) {
      return success({ message: '確認メールを送信しました（登録済みの場合）。' })
    }

    const token = randomUUID()
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        tokenExpiresAt,
      },
    })

    await sendVerificationEmail(email, user.fullName, token)

    return success({ message: '確認メールを送信しました。' })
  } catch (err) {
    return error(err)
  }
}
