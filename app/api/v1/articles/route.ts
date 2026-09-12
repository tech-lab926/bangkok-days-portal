import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error, paginated } from '@/lib/api-response'
import { articleFilterSchema } from '@/lib/validations/article'
import { paginationSchema } from '@/lib/validations/common'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const params = Object.fromEntries(searchParams)
    
    const filters = articleFilterSchema.parse(params)
    const { page, limit } = paginationSchema.parse(params)
    
    const where: any = {}
    if (filters.type) where.type = filters.type
    if (filters.published !== undefined) where.published = filters.published
    
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          translations: {
            where: { locale: filters.locale }
          },
          tags: { include: { tag: { include: { translations: { where: { locale: filters.locale } } } } } }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ]
      }),
      prisma.article.count({ where })
    ])
    
    return paginated(articles, total, page, limit, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' })
  } catch (err) {
    return error(err)
  }
}
