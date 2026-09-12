import prisma from "../lib/prisma";
import { withRetry } from "./utils";

async function main() {
  const tagJapanese = await withRetry(() => prisma.tag.findUnique({ where: { slug: "japanese-food" } }));
  const tagJapaneseStaff = await withRetry(() => prisma.tag.findUnique({ where: { slug: "japanese-staff" } }));

  const articles = [
    {
      slug: "bangkok-japanese-restaurant-2025",
      type: "NEWS" as const,
      published: true,
      featured: true,
      publishedAt: new Date("2026-04-23"),
      translations: {
        create: [
          {
            locale: "ja",
            title: "2025年バンコクのおすすめ日本料理店10選",
            excerpt: "おすすめの日本料理店まとめ。スクンビット・シーロム・トンローエリアの人気店を厳選してご紹介します。",
            content: "<p>バンコクには数多くの日本料理店があります。今回はエリア別におすすめの10店舗をご紹介します。</p>",
            coverUrl: "/img/temp_p.png",
          },
        ],
      },
      ...(tagJapanese || tagJapaneseStaff
        ? {
            tags: {
              create: [
                ...(tagJapanese ? [{ tagId: tagJapanese.id }] : []),
                ...(tagJapaneseStaff ? [{ tagId: tagJapaneseStaff.id }] : []),
              ],
            },
          }
        : {}),
    },
    {
      slug: "bts-new-route-extension-2025",
      type: "NEWS" as const,
      published: true,
      featured: false,
      publishedAt: new Date("2025-03-01"),
      translations: {
        create: [
          {
            locale: "ja",
            title: "BTS新路線延伸のお知らせ",
            excerpt: "BTSスクンビット線が延伸され、新駅が開業しました。通勤・通学に便利な新ルートをご確認ください。",
            content: "<p>2025年3月よりBTSスクンビット線の延伸区間が開業しました。</p>",
            coverUrl: "/img/temp_p.png",
          },
        ],
      },
    },
  ];

  for (const article of articles) {
    await withRetry(() =>
      prisma.article.upsert({
        where: { slug: article.slug },
        update: {},
        create: article,
      })
    );
    console.log(`✅ Seeded article: ${article.slug}`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
