import { spawnSync } from "node:child_process";
import prisma from "../lib/prisma";

async function clearDatabase() {
  console.log("Clearing existing data...");

  // Child tables first
  await prisma.storeBilling.deleteMany();
  await prisma.monthlyBilling.deleteMany();

  await prisma.placeImage.deleteMany();
  await prisma.placeTag.deleteMany();
  await prisma.placeCategory.deleteMany();
  await prisma.placeScene.deleteMany();
  await prisma.placeTranslation.deleteMany();
  await prisma.place.deleteMany();

  await prisma.articleTranslation.deleteMany();
  await prisma.article.deleteMany();

  await prisma.communityReply.deleteMany();
  await prisma.communityPost.deleteMany();

  await prisma.inquiry.deleteMany();
  await prisma.media.deleteMany();
  await prisma.featuredPage.deleteMany();
  await prisma.globalSettings.deleteMany();

  await prisma.owner.deleteMany();
  await prisma.pricingPlan.deleteMany();

  await prisma.areaTranslation.deleteMany();
  await prisma.area.deleteMany();

  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();

  await prisma.sceneTranslation.deleteMany();
  await prisma.scene.deleteMany();

  await prisma.tagTranslation.deleteMany();
  await prisma.tag.deleteMany();

  await prisma.user.deleteMany();
  await prisma.adminUser.deleteMany();

  console.log("Database cleared");
}

async function main() {
  await clearDatabase();
  await prisma.$disconnect();

  console.log("Running seed script...");

  const result = spawnSync("npx", ["tsx", "scripts/seed.ts"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  console.log("Database populated successfully");
}

main().catch(async (err) => {
  console.error("Populate failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
