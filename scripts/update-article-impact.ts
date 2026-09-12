import prisma from "../lib/prisma";
import { withRetry } from "./utils";

async function main() {
  const articles = await withRetry(() =>
    prisma.article.findMany({
      select: { id: true, slug: true },
      where: { type: "NEWS" },
      orderBy: { publishedAt: "desc" },
    })
  );

  if (articles.length === 0) {
    console.log("No NEWS articles found.");
    return;
  }

  const updates = [
    { impactLevel: "HIGH",   newsCategory: "TRANSPORT" },
    { impactLevel: "HIGH",   newsCategory: "SYSTEM"    },
    { impactLevel: "MEDIUM", newsCategory: "BUSINESS"  },
    { impactLevel: "MEDIUM", newsCategory: "NIGHT"     },
    { impactLevel: "LOW",    newsCategory: "LIFE"       },
    { impactLevel: "LOW",    newsCategory: "EVENT"      },
  ] as const;

  for (let i = 0; i < articles.length; i++) {
    const { impactLevel, newsCategory } = updates[i % updates.length];
    await withRetry(() =>
      prisma.article.update({
        where: { id: articles[i].id },
        data: { impactLevel, newsCategory },
      })
    );
    console.log(`✅ ${articles[i].slug} → ${impactLevel} / ${newsCategory}`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
