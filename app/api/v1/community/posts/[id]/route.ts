import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { errors } from '@/lib/errors'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.communityPost.findUnique({
      where: { id, hidden: false },
      include: {
        replies: {
          where: { hidden: false },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!post) throw errors.notFound('Post')

    return success(post)
  } catch (err) {
    return error(err)
  }
}
