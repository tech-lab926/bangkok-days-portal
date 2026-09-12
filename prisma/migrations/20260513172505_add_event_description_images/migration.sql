-- AlterTable
ALTER TABLE "today_events" ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
