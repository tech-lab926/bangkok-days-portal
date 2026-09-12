import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error, paginated } from '@/lib/api-response'
import { paginationSchema } from '@/lib/validations/common'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const params = Object.fromEntries(searchParams)

    const { page, limit } = paginationSchema.parse(params)
    const locale = searchParams.get('locale') || 'ja'
    const areaId = searchParams.get('areaId')
    const categoryId = searchParams.get('categoryId')
    const sceneId = searchParams.get('sceneId')
    const type = searchParams.get('type')
    const featured = searchParams.get('featured')
    const q = searchParams.get('q')

    const where: Record<string, unknown> = { isVisible: true }

    if (areaId) where.areaId = areaId
    if (categoryId) {
      where.categories = { some: { categoryId } }
    }
    if (sceneId) {
      where.scenes = { some: { sceneId } }
    }
    if (type === 'NIGHT' || type === 'NORMAL') {
      where.type = type
    }
    if (featured === 'true') {
      where.showSpotlight = true
    }
    if (q) {
      where.translations = {
        some: {
          locale,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
      }
    }

    const sortBy = searchParams.get('sortBy') || 'displayPriority'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const orderBy: any[] =
      sortBy === 'viewCount' ? [{ viewCount: sortOrder }] :
      sortBy === 'createdAt' ? [{ createdAt: sortOrder }] :
      [{ displayPriority: 'desc' }, { showSpotlight: 'desc' }, { createdAt: 'desc' }]

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        include: {
          translations: { where: { locale } },
          area: { include: { translations: { where: { locale } } } },
          categories: { include: { category: { include: { translations: { where: { locale } } } } } },
          scenes: { include: { scene: { include: { translations: { where: { locale } } } } } },
          images: { orderBy: { order: 'asc' }, take: 1 },
          tags: { include: { tag: { include: { translations: { where: { locale } } } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.place.count({ where }),
    ])

    return paginated(places, total, page, limit, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' })
  } catch (err) {
    return error(err)
  }
}
