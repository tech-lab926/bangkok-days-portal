import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { requirePermission } from '@/lib/permissions'
import { errors } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requirePermission('users', 'canEdit')
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) throw errors.badRequest('userId required')

    const [questions, answers] = await Promise.all([
      prisma.qaQuestion.findMany({
        where: { authorId: userId },
        select: { id: true, title: true, slug: true, createdAt: true, hidden: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.qaAnswer.findMany({
        where: { authorId: userId },
        select: {
          id: true, content: true, createdAt: true, hidden: true,
          questionId: true,
          question: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    return success({ questions, answers })
  } catch (err) {
    return error(err)
  }
}
