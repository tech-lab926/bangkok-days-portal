-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('ALL', 'LIFE', 'TRANSPORT', 'BUSINESS', 'NIGHT', 'EVENT', 'SYSTEM');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "impactLevel" "ImpactLevel",
ADD COLUMN     "newsCategory" "NewsCategory";
