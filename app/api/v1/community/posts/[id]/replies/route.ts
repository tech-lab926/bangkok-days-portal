import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { createReplySchema } from '@/lib/validations/community'
import { errors } from '@/lib/errors'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = createReplySchema.parse(body)

    const post = await prisma.communityPost.findUnique({
      where: { id }
    })

    if (!post) throw errors.notFound('Post')

    const reply = await prisma.communityReply.create({
      data: {
        ...data,
        postId: id
      }
    })

    return success(reply, 201)
  } catch (err) {
    return error(err)
  }
}
