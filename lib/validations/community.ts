import { z } from 'zod'
import { localeSchema } from './common'

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  locale: localeSchema.default('ja'),
})

export const createReplySchema = z.object({
  content: z.string().min(1),
})

export type CreatePost = z.infer<typeof createPostSchema>
export type CreateReply = z.infer<typeof createReplySchema>
