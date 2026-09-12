import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { requirePermission } from '@/lib/permissions'
import { createArticleSchema, updateArticleSchema } from '@/lib/validations/article'
import { errors } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requirePermission("articles", "canView")
    
    const { searchParams } = req.nextUrl
    const search = searchParams.get('search')
    const type = searchParams.get('type') // "NEWS" | "GUIDE" | null (all)
    
    const where: any = {}
    if (type === 'NEWS' || type === 'GUIDE') where.type = type
    if (search) {
      where.translations = { some: { title: { contains: search, mode: 'insensitive' } } }
    }
    
    const articles = await prisma.article.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        translations: true,
        tags: { include: { tag: { include: { translations: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return success({ items: articles })
  } catch (err) {
    return error(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("articles", "canCreate")
    
    const body = await req.json()
    const data = createArticleSchema.parse(body)
    
    const { translations, tagIds, ...articleData } = data
    
    const article = await prisma.article.create({
      data: {
        ...articleData,
        publishedAt: data.published ? new Date() : null,
        translations: { create: translations },
        ...(tagIds?.length && {
          tags: { create: tagIds.map((tagId) => ({ tagId })) }
        })
      },
      include: {
        translations: true,
        tags: { include: { tag: { include: { translations: true } } } }
      }
    })
    
    return success(article, 201)
  } catch (err) {
    return error(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("articles", "canEdit")
    
    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('Article ID required')
    
    const body = await req.json()
    const data = updateArticleSchema.parse(body)
    
    const { translations, tagIds, ...articleData } = data
    
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...articleData,
        ...(data.published !== undefined && {
          publishedAt: data.published ? new Date() : null
        }),
        ...(translations && {
          translations: { deleteMany: {}, create: translations }
        }),
        ...(tagIds !== undefined && {
          tags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) }
        })
      },
      include: {
        translations: true,
        tags: { include: { tag: { include: { translations: true } } } }
      }
    })
    
    return success(article)
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("articles", "canDelete")
    
    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('Article ID required')
    
    await prisma.article.delete({ where: { id } })
    
    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
