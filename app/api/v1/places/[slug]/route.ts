import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { errors } from '@/lib/errors'
import { localeSchema } from '@/lib/validations/common'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = req.nextUrl
    const locale = localeSchema.parse(searchParams.get('locale') || 'ja')

    const place = await prisma.place.findUnique({
      where: { slug, isVisible: true },
      include: {
        translations: { where: { locale } },
        area: {
          include: {
            translations: { where: { locale } }
          }
        },
        categories: {
          include: {
            category: {
              include: {
                translations: { where: { locale } }
              }
            }
          }
        },
        scenes: {
          include: {
            scene: {
              include: {
                translations: { where: { locale } }
              }
            }
          }
        },
        images: { orderBy: { order: 'asc' } },
        tags: {
          include: {
            tag: {
              include: {
                translations: { where: { locale } }
              }
            }
          }
        }
      }
    })

    if (!place) throw errors.notFound('Place')

    await prisma.place.update({
      where: { id: place.id },
      data: { viewCount: { increment: 1 } }
    })

    return success(place)
  } catch (err) {
    return error(err)
  }
}
