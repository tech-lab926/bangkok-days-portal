import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { requireRole } from "@/lib/auth"
import { errors } from "@/lib/errors"

// All available resources that can be permission-controlled
export const RESOURCES = [
  "stores",
  "articles",
  "areas",
  "categories",
  "scenes",
  "tags",
  "owners",
  "revenue",
  "pricing_plans",
  "inquiries",
  "featured",
  "curated_lists",
  "today_events",
  "jobs",
  "auto_news",
  "media",
  "community",
  "settings",
  "admin_users",
  "users",
] as const

// GET /api/v1/admin/permissions
// Returns all permissions and all assignable role codes (system + custom, excluding SUPER_ADMIN)
export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN"])

    const [permissions, allRoles] = await Promise.all([
      prisma.rolePermission.findMany({
        orderBy: [{ role: "asc" }, { resource: "asc" }],
      }),
      prisma.customRole.findMany({
        orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
      }),
    ])

    // Exclude SUPER_ADMIN from the assignable list (always full access)
    const roles = allRoles.filter(r => r.code !== "SUPER_ADMIN")

    return success({ permissions, resources: RESOURCES, roles })
  } catch (err) {
    return error(err)
  }
}

// PUT /api/v1/admin/permissions
// Upsert all permissions for a given role
export async function PUT(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN"])
    const body = await req.json()

    if (!Array.isArray(body)) throw errors.badRequest("Expected array of permissions")

    // Run upserts in parallel — each is idempotent so no transaction needed
    await Promise.all(
      body.map((p: { role: string; resource: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }) =>
        prisma.rolePermission.upsert({
          where: { role_resource: { role: p.role, resource: p.resource } },
          create: { role: p.role, resource: p.resource, canView: p.canView, canCreate: p.canCreate, canEdit: p.canEdit, canDelete: p.canDelete },
          update: { canView: p.canView, canCreate: p.canCreate, canEdit: p.canEdit, canDelete: p.canDelete },
        })
      )
    )

    const permissions = await prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { resource: "asc" }],
    })
    return success(permissions)
  } catch (err) {
    return error(err)
  }
}
