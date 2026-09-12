"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getArticles, type Article } from "@/lib/public-api";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles({ type: "GUIDE", published: "true", limit: "50" })
      .then((d) => setArticles(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen pb-16">
      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-[24px] font-bold text-[#004098]">ガイド記事</h1>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border bg-white">
                <div className="h-44 w-full rounded-t-xl bg-gray-200" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  <div className="h-5 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-[14px] text-[#999]">記事がありません。</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const t = article.translations[0];
              const date = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("ja-JP")
                : "";
              return (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="overflow-hidden rounded-xl border border-[#e0e6f0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-44 w-full bg-[#e8edf5]">
                    {t?.coverUrl ? (
                      <Image src={t.coverUrl} alt={t.title || ""} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#aab] text-[13px]">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-[#004098] px-2 py-0.5 text-[10px] font-semibold text-white">特集</span>
                      {date && <span className="text-[11px] text-[#999]">{date}</span>}
                    </div>
                    <h2 className="text-[15px] font-bold text-[#1a1a1a] leading-snug">{t?.title || article.slug}</h2>
                    {t?.excerpt && (
                      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#666]">{t.excerpt}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
