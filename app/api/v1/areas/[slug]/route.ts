import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { errors } from '@/lib/errors'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const locale = req.nextUrl.searchParams.get('locale') || 'ja'

    const area = await prisma.area.findUnique({
      where: { slug },
      include: {
        translations: { where: { locale } },
        _count: { select: { places: true } },
      },
    })

    if (!area) throw errors.notFound('エリアが見つかりません')

    return success(area)
  } catch (err) {
    return error(err)
  }
}
