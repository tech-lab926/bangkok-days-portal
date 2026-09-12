import prisma from "../lib/prisma"

const RESOURCES = [
  "stores", "articles", "areas", "categories", "scenes", "tags",
  "owners", "revenue", "pricing_plans", "inquiries", "featured",
  "curated_lists", "today_events", "jobs", "auto_news", "media",
  "community", "settings", "admin_users", "users",
]

// Default permissions: ADMIN gets almost everything, EDITOR gets content only
const ADMIN_DEFAULTS: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {}
const EDITOR_DEFAULTS: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {}

for (const r of RESOURCES) {
  // ADMIN: full access except admin_users
  ADMIN_DEFAULTS[r] = { canView: true, canCreate: true, canEdit: true, canDelete: r !== "admin_users" }
  // EDITOR: view/create/edit content, no delete, no sensitive resources
  const sensitive = ["revenue", "pricing_plans", "settings", "admin_users", "users"]
  if (sensitive.includes(r)) {
    EDITOR_DEFAULTS[r] = { canView: false, canCreate: false, canEdit: false, canDelete: false }
  } else {
    EDITOR_DEFAULTS[r] = { canView: true, canCreate: true, canEdit: true, canDelete: false }
  }
}

async function main() {
  for (const resource of RESOURCES) {
    await prisma.rolePermission.upsert({
      where: { role_resource: { role: "ADMIN", resource } },
      create: { role: "ADMIN", resource, ...ADMIN_DEFAULTS[resource] },
      update: ADMIN_DEFAULTS[resource],
    })
    await prisma.rolePermission.upsert({
      where: { role_resource: { role: "EDITOR", resource } },
      create: { role: "EDITOR", resource, ...EDITOR_DEFAULTS[resource] },
      update: EDITOR_DEFAULTS[resource],
    })
  }
  console.log("✅ Default permissions seeded for ADMIN and EDITOR roles")
}

main().catch(console.error).finally(() => prisma.$disconnect())
