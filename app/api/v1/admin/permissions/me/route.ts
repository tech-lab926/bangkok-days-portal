import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requireAuth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/permissions"

// GET /api/v1/admin/permissions/me
// Returns the permission rows for the current user's effective role
export async function GET() {
  try {
    const session = await requireAuth()
    const effectiveRole = getEffectiveRole(session.user as { role: string; customRole?: string | null })

    // SUPER_ADMIN always has full access — return empty array (client handles this)
    if (effectiveRole === "SUPER_ADMIN") return success([])

    const permissions = await prisma.rolePermission.findMany({
      where: { role: effectiveRole },
    })
    return success(permissions)
  } catch (err) {
    return error(err)
  }
}
