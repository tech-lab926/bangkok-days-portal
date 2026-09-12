import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { errors } from '@/lib/errors'
import { requirePermission } from '@/lib/permissions'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("articles", "canView")
    
    const { id } = await params
    
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        translations: true,
        tags: { include: { tag: { include: { translations: true } } } }
      }
    })
    
    if (!article) {
      return error(errors.notFound('Article'))
    }
    
    return success(article)
  } catch (err) {
    return error(err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("articles", "canEdit")
    
    const { id } = await params
    const body = await req.json()
    
    const article = await prisma.article.update({
      where: { id },
      data: {
        published: body.published,
        publishedAt: body.published ? new Date() : null
      },
      include: { translations: true }
    })
    
    return success(article)
  } catch (err) {
    return error(err)
  }
}
