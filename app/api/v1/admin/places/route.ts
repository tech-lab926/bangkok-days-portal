import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { requirePermission } from '@/lib/permissions'
import { createPlaceSchema, updatePlaceSchema } from '@/lib/validations/place'
import { errors } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    await requirePermission("stores", "canCreate")

    const body = await req.json()
    const data = createPlaceSchema.parse(body)

    const { translations, tagIds, categoryIds, sceneIds, ...placeData } = data

    const place = await prisma.place.create({
      data: {
        ...placeData,
        translations: { create: translations },
        ...(categoryIds?.length && {
          categories: { create: categoryIds.map(categoryId => ({ categoryId })) }
        }),
        ...(sceneIds?.length && {
          scenes: { create: sceneIds.map(sceneId => ({ sceneId })) }
        }),
        ...(tagIds?.length && {
          tags: { create: tagIds.map(tagId => ({ tagId })) }
        })
      },
      include: {
        translations: true,
        categories: { include: { category: true } },
        scenes: { include: { scene: true } },
        tags: { include: { tag: true } }
      }
    })

    return success(place, 201)
  } catch (err) {
    return error(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("stores", "canEdit")

    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('Place ID required')

    const body = await req.json()
    const data = updatePlaceSchema.parse(body)

    const { translations, tagIds, categoryIds, sceneIds, ...placeData } = data

    const place = await prisma.place.update({
      where: { id },
      data: {
        ...placeData,
        ...(translations && {
          translations: { deleteMany: {}, create: translations }
        }),
        ...(categoryIds && {
          categories: { deleteMany: {}, create: categoryIds.map(categoryId => ({ categoryId })) }
        }),
        ...(sceneIds && {
          scenes: { deleteMany: {}, create: sceneIds.map(sceneId => ({ sceneId })) }
        }),
        ...(tagIds && {
          tags: { deleteMany: {}, create: tagIds.map(tagId => ({ tagId })) }
        })
      },
      include: {
        translations: true,
        categories: { include: { category: true } },
        scenes: { include: { scene: true } },
        tags: { include: { tag: true } }
      }
    })

    return success(place)
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("stores", "canDelete")

    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('Place ID required')

    await prisma.place.delete({ where: { id } })

    return success({ deleted: true })
  } catch (err) {
    return error(err)
  }
}
