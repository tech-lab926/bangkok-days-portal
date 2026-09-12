/*
  Warnings:

  - A unique constraint covering the columns `[loginId]` on the table `admin_users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "loginId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_loginId_key" ON "admin_users"("loginId");
