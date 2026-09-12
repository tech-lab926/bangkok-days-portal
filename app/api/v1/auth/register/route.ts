import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { registerSchema } from '@/lib/validations/user'
import { sendVerificationEmail } from '@/lib/email'
import { success, error } from '@/lib/api-response'
import { errors } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      throw errors.badRequest(
        parsed.error.issues.map((e) => e.message).join(', ')
      )
    }

    const { email, password, fullName } = parsed.data
    const normalizedEmail = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (!existing.emailVerified) {
        const token = randomUUID()
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await prisma.user.update({
          where: { id: existing.id },
          data: {
            password: await hashPassword(password),
            fullName,
            verificationToken: token,
            tokenExpiresAt,
          },
        })

        await sendVerificationEmail(normalizedEmail, fullName, token)

        return success(
          { message: '確認メールを送信しました。メールをご確認ください。' },
          201
        )
      }

      throw errors.conflict('このメールアドレスは既に登録されています')
    }

    const token = randomUUID()
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const hashedPassword = await hashPassword(password)

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName,
        verificationToken: token,
        tokenExpiresAt,
      },
    })

    await sendVerificationEmail(normalizedEmail, fullName, token)

    return success(
      { message: '確認メールを送信しました。メールをご確認ください。' },
      201
    )
  } catch (err) {
    return error(err)
  }
}
