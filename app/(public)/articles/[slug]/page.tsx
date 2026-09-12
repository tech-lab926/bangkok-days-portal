import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Breadcrumb } from "@/components/public/Breadcrumb";

async function getArticleData(slug: string) {
  const [article, related] = await Promise.all([
    prisma.article.findUnique({
      where: { slug, published: true, type: "GUIDE" },
      include: { translations: { where: { locale: "ja" } } },
    }),
    prisma.article.findMany({
      where: { published: true, type: "GUIDE", slug: { not: slug } },
      take: 5,
      orderBy: { viewCount: "desc" },
      include: { translations: { where: { locale: "ja" } } },
    }),
  ]);
  return { article, related };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { article } = await getArticleData(slug);
  if (!article) return { title: "記事が見つかりません" };

  const t = article.translations[0];
  const a = article as any;
  const title = a.seoTitle || t?.title || slug;
  const desc = a.seoDescription || t?.excerpt || t?.content?.replace(/<[^>]+>/g, "").slice(0, 120) || "";
  const ogTitle = a.ogTitle || title;
  const ogImage = a.ogImage || t?.coverUrl;
  const canonical = a.canonicalUrl || `/articles/${slug}`;

  return {
    title,
    description: desc,
    openGraph: {
      title: ogTitle,
      description: desc,
      ...(ogImage && { images: [{ url: ogImage }] }),
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
    alternates: { canonical },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { article, related } = await getArticleData(slug);
  if (!article) notFound();

  const t = article.translations[0];
  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("ja-JP") : "";

  return (
    <div className="bg-[#f5f7fa] pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": (article as any).schemaType || "Article",
        headline: t?.title || slug,
        description: t?.excerpt || "",
        ...(t?.coverUrl && { image: t.coverUrl }),
        datePublished: article.publishedAt?.toISOString(),
        publisher: { "@type": "Organization", name: "バンコクデイズ", url: "https://bangkok-days.com" },
      }) }} />

      {/* Hero cover */}
      {t?.coverUrl && (
        <div className="relative w-full h-[280px] sm:h-[380px] overflow-hidden">
          <Image src={t.coverUrl} alt={t.title || ""} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-8">
            <div className="mx-auto max-w-[860px]">
              <span className="inline-block bg-[#004098] text-white text-[11px] font-bold px-3 py-1 rounded mb-3 tracking-wide">特集</span>
              <h1 className="text-[22px] sm:text-[32px] font-black text-white leading-[1.35] drop-shadow">{t?.title || slug}</h1>
              <div className="flex gap-4 text-[12px] text-white/80 mt-3">
                {date && <span>{date}</span>}
                <span>バンコクデイズ編集部</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-6">
        <div className="mb-5">
          <Breadcrumb items={[
            { label: "TOP", href: "/" },
            { label: "ガイド記事", href: "/articles" },
            { label: t?.title || slug },
          ]} />
        </div>

        {/* Title block (when no cover image) */}
        {!t?.coverUrl && (
          <div className="bg-white rounded-xl p-6 sm:p-8 mb-6 shadow-sm border border-[#e8edf3]">
            <span className="inline-block bg-[#004098] text-white text-[11px] font-bold px-3 py-1 rounded mb-3 tracking-wide">特集</span>
            <h1 className="text-[24px] sm:text-[30px] font-black text-[#1a2a3a] leading-[1.4]">{t?.title || slug}</h1>
            <div className="flex gap-4 text-[13px] text-[#999] mt-3">
              {date && <span>{date}</span>}
              <span>バンコクデイズ編集部</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main article */}
          <article className="bg-white rounded-xl shadow-sm border border-[#e8edf3] p-6 sm:p-8">
            {t?.excerpt && (
              <div className="bg-[#f0f5ff] border-l-4 border-[#004098] rounded-r-lg px-5 py-4 mb-8 text-[14px] text-[#334] leading-relaxed">
                {t.excerpt}
              </div>
            )}
            {t?.content && (
              <div
                className="prose prose-base max-w-none text-[15px] leading-[1.85] text-[#333]
                  [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:text-[#1a2a3a] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pl-4 [&_h2]:border-l-4 [&_h2]:border-[#004098] [&_h2]:bg-[#f8faff] [&_h2]:py-2 [&_h2]:rounded-r
                  [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:text-[#1a2a3a] [&_h3]:mt-7 [&_h3]:mb-3
                  [&_h4]:text-[15px] [&_h4]:font-bold [&_h4]:text-[#1a2a3a] [&_h4]:mt-5 [&_h4]:mb-2
                  [&_p]:mb-5 [&_ul]:pl-6 [&_ul]:mb-5 [&_li]:mb-2 [&_ol]:pl-6 [&_ol]:mb-5
                  [&_strong]:text-[#1a2a3a] [&_strong]:font-bold
                  [&_a]:text-[#004098] [&_a]:underline [&_a]:underline-offset-2
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#d0daea] [&_blockquote]:pl-4 [&_blockquote]:text-[#666] [&_blockquote]:italic [&_blockquote]:my-5
                  [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6 [&_table]:text-[14px]
                  [&_th]:bg-[#f0f5ff] [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-[#d8e4f0] [&_th]:text-[#1a2a3a]
                  [&_td]:px-4 [&_td]:py-2.5 [&_td]:border [&_td]:border-[#e8edf3]"
                dangerouslySetInnerHTML={{ __html: t.content }}
              />
            )}
            {!t?.content && t?.excerpt && <p className="text-[15px] leading-[1.85] text-[#444]">{t.excerpt}</p>}
          </article>

          {/* Sidebar */}
          <aside className="space-y-5">
            {related.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-[#e8edf3] p-5">
                <h3 className="text-[14px] font-bold text-[#1a2a3a] mb-4 pb-2 border-b-2 border-[#004098]">人気ガイド記事</h3>
                <div className="space-y-0">
                  {related.map((a, i) => {
                    const at = a.translations[0];
                    return (
                      <Link key={a.slug} href={`/articles/${a.slug}`}
                        className="flex gap-3 items-start py-3 border-b border-[#f0f0f0] last:border-0 hover:text-[#004098] transition-colors group">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004098] text-[11px] font-bold text-white mt-0.5">{i + 1}</span>
                        <span className="text-[13px] font-medium text-[#333] leading-[1.45] line-clamp-2 group-hover:text-[#004098]">{at?.title || a.slug}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-[#004098] rounded-xl p-5 text-white text-center">
              <p className="text-[14px] font-bold mb-1">バンコクで店舗を探す</p>
              <p className="text-[12px] text-white/80 mb-3">日本人向けの厳選店舗を掲載中</p>
              <Link href="/shops"
                className="inline-block bg-white text-[#004098] text-[13px] font-bold px-5 py-2 rounded-full hover:bg-[#f0f5ff] transition">
                店舗一覧を見る →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
