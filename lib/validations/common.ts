import { z } from 'zod'

export const localeSchema = z.enum(['ja', 'en', 'th'])

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const idSchema = z.string().uuid()

export const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/)

export type Locale = z.infer<typeof localeSchema>
export type Pagination = z.infer<typeof paginationSchema>
