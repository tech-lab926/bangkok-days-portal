/*
  Warnings:

  - You are about to drop the `curated_list_places` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `curated_lists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "curated_list_places" DROP CONSTRAINT "curated_list_places_curatedListId_fkey";

-- DropForeignKey
ALTER TABLE "curated_list_places" DROP CONSTRAINT "curated_list_places_placeId_fkey";

-- AlterTable
ALTER TABLE "today_events" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "contactUrl" TEXT,
ADD COLUMN     "lineId" TEXT;

-- DropTable
DROP TABLE "curated_list_places";

-- DropTable
DROP TABLE "curated_lists";
