-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "category" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0;
