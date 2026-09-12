import { z } from 'zod'
import { localeSchema } from './common'

export const placeFilterSchema = z.object({
  areaId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  locale: localeSchema.default('ja'),
})

export const createPlaceSchema = z.object({
  slug: z.string().min(1).max(200),
  type: z.enum(['NORMAL', 'NIGHT']).default('NORMAL'),
  areaId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  openingHours: z.string().optional(),
  nearestStation: z.string().optional(),
  regularHoliday: z.string().optional(),
  languages: z.array(z.string()).default([]),
  snsInstagram: z.string().optional(),
  snsX: z.string().optional(),
  snsFacebook: z.string().optional(),
  snsLine: z.string().optional(),
  snsTiktok: z.string().optional(),
  isVisible: z.boolean().default(false),
  showSpotlight: z.boolean().default(false),
  showNightNavi: z.boolean().default(false),
  translations: z.array(z.object({
    locale: localeSchema,
    name: z.string().min(1),
    description: z.string(),
  })).min(1),
  categoryIds: z.array(z.string().uuid()).default([]),
  sceneIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).optional(),
})

export const updatePlaceSchema = createPlaceSchema.partial()

export type PlaceFilter = z.infer<typeof placeFilterSchema>
export type CreatePlace = z.infer<typeof createPlaceSchema>
export type UpdatePlace = z.infer<typeof updatePlaceSchema>
