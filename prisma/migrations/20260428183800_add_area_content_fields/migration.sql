-- AlterTable
ALTER TABLE "areas" ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "ratingBeginner" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingJapanese" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingNightCaution" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingNightlife" INTEGER NOT NULL DEFAULT 0;
