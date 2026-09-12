-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "description" TEXT,
ADD COLUMN     "placeId" TEXT;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;
