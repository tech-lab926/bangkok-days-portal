-- AlterTable
ALTER TABLE "places" ADD COLUMN     "displayPriority" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "pricing_plans" ADD COLUMN     "displayPriority" INTEGER NOT NULL DEFAULT 0;
