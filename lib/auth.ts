import { getServerSession } from "next-auth"
import { authOptions } from "./auth-options"
import { errors } from "./errors"

export const getSession = () => getServerSession(authOptions)

export const requireAuth = async () => {
  const session = await getSession()
  if (!session?.user) throw errors.unauthorized()
  return session
}

export const requireRole = async (allowedRoles: string[]) => {
  const session = await requireAuth()
  const user = session.user as { role: string; customRole?: string | null }
  const effectiveRole = user.customRole ?? user.role
  if (!allowedRoles.includes(effectiveRole)) throw errors.forbidden()
  return session
}

