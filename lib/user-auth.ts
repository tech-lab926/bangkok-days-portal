import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { ApiError, errors } from './errors'

export async function getUserSession() {
  const session = await getServerSession(authOptions)
  return session
}

export async function requireUser() {
  const session = await getUserSession()
  if (!session?.user) throw errors.unauthorized()
  if (session.user.userType !== 'user') throw errors.forbidden()
  return session
}

export async function requireVerifiedUser() {
  const session = await requireUser()
  if (!session.user.emailVerified) {
    throw new ApiError(
      403,
      'メールアドレスが確認されていません',
      'EMAIL_NOT_VERIFIED'
    )
  }
  return session
}
