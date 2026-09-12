-- Migration: add_custom_roles_fk
-- Adds proper foreign key constraints derived from the Prisma schema relations:
--   AdminUser.customRole -> CustomRole.code
--   RolePermission.role  -> CustomRole.code
-- Both relations use ON DELETE SET NULL / RESTRICT respectively.

-- AddForeignKey: RolePermission.role → CustomRole.code
-- ON DELETE CASCADE so deleting a custom role removes its permission rows
ALTER TABLE "role_permissions"
  ADD CONSTRAINT "role_permissions_role_fkey"
  FOREIGN KEY ("role") REFERENCES "custom_roles"("code")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: AdminUser.customRole → CustomRole.code
-- ON DELETE SET NULL so deleting a custom role clears the assignment on users
ALTER TABLE "admin_users"
  ADD CONSTRAINT "admin_users_customRole_fkey"
  FOREIGN KEY ("customRole") REFERENCES "custom_roles"("code")
  ON DELETE SET NULL ON UPDATE CASCADE;
