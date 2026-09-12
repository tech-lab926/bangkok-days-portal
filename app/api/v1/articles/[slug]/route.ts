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

    const article = await prisma.article.findUnique({
      where: { slug, published: true },
      include: {
        translations: { where: { locale } }
      }
    })

    if (!article) throw errors.notFound('Article')

    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    })

    return success(article)
  } catch (err) {
    return error(err)
  }
}
