import prisma from "../lib/prisma";

const PLACEHOLDER = "/img/placeholder.png";

async function main() {
  // Only update Unsplash URLs to placeholder, leave Cloudinary alone
  const result = await prisma.placeImage.updateMany({
    where: { 
      url: { contains: "unsplash.com" }
    },
    data: { url: PLACEHOLDER },
  });
  console.log(`Updated ${result.count} images to placeholder`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
