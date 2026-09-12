/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `scenes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "scenes" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "scenes_slug_key" ON "scenes"("slug");
