import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/[A-Za-z]/, 'パスワードには英字を含めてください')
    .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  fullName: z.string().min(1, '名前を入力してください').max(100),
})

export const loginUserSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
})

export const resendVerificationSchema = z.object({
  email: z.string().email(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginUserInput = z.infer<typeof loginUserSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
