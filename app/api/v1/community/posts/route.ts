import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error, paginated } from '@/lib/api-response'
import { paginationSchema, localeSchema } from '@/lib/validations/common'
import { createPostSchema } from '@/lib/validations/community'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const params = Object.fromEntries(searchParams)
    
    const { page, limit } = paginationSchema.parse(params)
    const locale = localeSchema.parse(params.locale || 'ja')
    
    const where = { hidden: false, locale }
    
    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          _count: {
            select: { replies: true }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.communityPost.count({ where })
    ])
    
    return paginated(posts, total, page, limit)
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createPostSchema.parse(body)
    
    const post = await prisma.communityPost.create({
      data
    })
    
    return success(post, 201)
  } catch (err) {
    return error(err)
  }
}
