import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { localeSchema } from '@/lib/validations/common'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const locale = localeSchema.parse(searchParams.get('locale') || 'ja')
    
    const tags = await prisma.tag.findMany({
      include: {
        translations: {
          where: { locale }
        }
      }
    })
    
    return success(tags)
  } catch (err) {
    return error(err)
  }
}
