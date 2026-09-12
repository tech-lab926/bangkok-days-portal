-- CreateTable
-- Generated from prisma/schema.prisma — model CustomRole
CREATE TABLE "custom_roles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_code_key" ON "custom_roles"("code");

-- Seed system roles into custom_roles (isSystem = true)
INSERT INTO "custom_roles" ("id","code","name","description","isSystem","createdAt","updatedAt") VALUES
  (gen_random_uuid(), 'SUPER_ADMIN', 'スーパー管理者', 'すべての権限を持ちます。', true, now(), now()),
  (gen_random_uuid(), 'ADMIN',       '管理者',         '主要な管理機能にアクセスできます。', true, now(), now()),
  (gen_random_uuid(), 'EDITOR',      '編集者',         'コンテンツの編集が可能です。', true, now(), now())
ON CONFLICT ("code") DO NOTHING;

-- AlterTable
-- Change RolePermission.role from Role enum to plain String
-- Postgres stores enum values as strings internally, so all existing rows (ADMIN, EDITOR, SUPER_ADMIN)
-- are preserved without data loss.
ALTER TABLE "role_permissions" ALTER COLUMN "role" TYPE TEXT;

-- AlterTable
-- Add optional customRole column to AdminUser
-- When set, customRole overrides the enum role field for permission lookups.
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "customRole" TEXT;
