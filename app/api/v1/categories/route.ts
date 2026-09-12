import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { localeSchema } from '@/lib/validations/common'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const locale = localeSchema.parse(searchParams.get('locale') || 'ja')
    
    const categories = await prisma.category.findMany({
      where: { enabled: true },
      include: {
        translations: {
          where: { locale }
        },
        _count: {
          select: { places: true }
        }
      },
      orderBy: { displayOrder: 'asc' }
    })
    
    return success(categories, 200, { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' })
  } catch (err) {
    return error(err)
  }
}
