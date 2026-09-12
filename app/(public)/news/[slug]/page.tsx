import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

const IMPACT_CONFIG = {
  HIGH: { label: "影響あり", badge: "inline-flex items-center gap-1 rounded-full border border-[#f2bdc3] bg-[#fdecef] px-3 py-0.5 text-[12px] font-bold text-[#ba2a35]", dot: "h-2.5 w-2.5 rounded-full bg-[#df2f40]" },
  MEDIUM: { label: "少し影響", badge: "inline-flex items-center gap-1 rounded-full border border-[#f0dfbd] bg-[#fbf4e7] px-3 py-0.5 text-[12px] font-bold text-[#9b7707]", dot: "h-2.5 w-2.5 rounded-full bg-[#f5bf17]" },
  LOW: { label: "影響なし", badge: "inline-flex items-center gap-1 rounded-full border border-[#b8e1bf] bg-[#ebf7ed] px-3 py-0.5 text-[12px] font-bold text-[#2f8137]", dot: "h-2.5 w-2.5 rounded-full bg-[#3bab46]" },
} as const;

const CAT_LABEL: Record<string, string> = {
  LIFE: "生活", TRANSPORT: "交通・移動", BUSINESS: "営業・店舗",
  NIGHT: "ナイト", EVENT: "イベント", SYSTEM: "制度・重要情報",
};

async function getArticleData(slug: string) {
  return prisma.article.findUnique({
    where: { slug, published: true, type: "NEWS" },
    include: { translations: { where: { locale: "ja" } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleData(slug);
  if (!article) return { title: "記事が見つかりません" };

  const t = article.translations[0];
  const title = t?.title || slug;
  const desc = t?.excerpt || t?.content?.replace(/<[^>]+>/g, "").slice(0, 120) || "";

  return {
    title: `${title} | バンコクデイズ ニュース`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      ...(t?.coverUrl && { images: [{ url: t.coverUrl }] }),
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
    alternates: { canonical: `/news/${slug}` },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleData(slug);
  if (!article) notFound();

  const t = article.translations[0];
  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("ja-JP") : "";
  const impact = article.impactLevel ? IMPACT_CONFIG[article.impactLevel as keyof typeof IMPACT_CONFIG] : null;
  const catLabel = article.newsCategory ? CAT_LABEL[article.newsCategory] : null;

  return (
    <div className="w-full bg-[#f3f4f6]">
      <div className="mx-auto w-full max-w-[980px] px-4 pb-12 pt-7 sm:px-6 lg:px-0">
        <div className="mb-5 flex items-center gap-2 text-[12px] text-[#999]">
          <Link href="/" className="text-[#004098]">TOP</Link>
          <span className="text-[#ccc]">›</span>
          <Link href="/news" className="text-[#004098]">ニュース</Link>
          <span className="text-[#ccc]">›</span>
          <span className="truncate">{t?.title || slug}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-semibold text-[#1f2b3d]">
          {date && <span>{date}</span>}
          {impact && <span className={impact.badge}><span className={impact.dot} />{impact.label}</span>}
          {catLabel && <span className="rounded-full bg-[#ebedf0] px-3 py-0.5 text-[12px] font-semibold text-[#4d586a]">{catLabel}</span>}
        </div>

        <h1 className="mt-5 text-center text-[19px] font-bold leading-[1.45] text-[#0f2f5f] md:text-[20px]">
          {t?.title || slug}
        </h1>

        {(t?.coverUrl || impact) && (
          <div className="mt-6 flex flex-col gap-4">
            {t?.coverUrl && (
              <div className="relative mx-auto w-full max-w-[600px] overflow-hidden rounded border border-[#d4d8df] bg-white" style={{ aspectRatio: "16/9" }}>
                <Image src={t.coverUrl} alt={t.title || ""} fill sizes="600px" className="object-cover" />
              </div>
            )}
            {impact && (
              <div className="border border-[#ef6f7a] bg-[#f7f3f5] px-5 py-5">
                <h2 className="text-[16px] font-semibold leading-tight text-[#1b3358]">在住日本人への影響</h2>
                {t?.excerpt && <p className="mt-2 text-[13px] leading-[1.7] text-[#243750]">{t.excerpt}</p>}
              </div>
            )}
          </div>
        )}

        {t?.content && (
          <section className="mt-9">
            <h2 className="text-[18px] font-bold text-[#123a70]">詳細</h2>
            <div className="mt-2 h-[3px] w-full bg-[#2d67b5]" />
            <div
              className="prose prose-sm mt-5 max-w-none text-[13px] leading-[1.7] text-[#18263d] [&_h2]:mb-2 [&_h2]:text-[15px] [&_h2]:font-bold [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: t.content }}
            />
          </section>
        )}
      </div>
    </div>
  );
}
