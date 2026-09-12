import { z } from 'zod'

export const createInquirySchema = z.object({
  type: z.enum(['STORE_LISTING', 'GENERAL']),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  storeName: z.string().optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1),
})

export const updateInquirySchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
})

export type CreateInquiry = z.infer<typeof createInquirySchema>
export type UpdateInquiry = z.infer<typeof updateInquirySchema>
