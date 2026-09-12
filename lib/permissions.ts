import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { errors } from "@/lib/errors"

type Action = "canView" | "canCreate" | "canEdit" | "canDelete"

/**
 * Returns the effective role code for permission lookups.
 * customRole (when set) takes precedence over the enum role.
 */
export function getEffectiveRole(user: { role: string; customRole?: string | null }): string {
  return user.customRole ?? user.role
}

/**
 * Check if the current user's role has permission for a resource+action.
 * SUPER_ADMIN always has full access.
 * If no permission row exists for a role+resource, access is denied.
 */
export async function requirePermission(resource: string, action: Action) {
  const session = await requireAuth()
  const effectiveRole = getEffectiveRole(session.user as { role: string; customRole?: string | null })

  // SUPER_ADMIN bypasses all permission checks
  if (effectiveRole === "SUPER_ADMIN") return session

  const perm = await prisma.rolePermission.findUnique({
    where: { role_resource: { role: effectiveRole, resource } },
  })

  if (!perm || !perm[action]) {
    throw errors.forbidden()
  }

  return session
}
