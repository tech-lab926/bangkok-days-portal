import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
})

// Coerces empty string "" to null for customRole
const customRoleField = z.preprocess(
  (v) => (v === "" ? null : v),
  z.string().min(1).max(64).nullable().optional()
)

export const createAdminSchema = z.object({
  loginId: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).default('EDITOR'),
  customRole: customRoleField,
})

export const updateAdminSchema = z.object({
  loginId: z.string().min(1).optional().nullable(),
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).optional(),
  customRole: customRoleField,
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

export type Login = z.infer<typeof loginSchema>
export type CreateAdmin = z.infer<typeof createAdminSchema>
export type UpdateAdmin = z.infer<typeof updateAdminSchema>
