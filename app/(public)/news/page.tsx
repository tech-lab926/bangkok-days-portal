"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { getArticles, type Article } from "@/lib/public-api";

const CATEGORIES = [
  { key: "ALL", label: "すべて" },
  { key: "LIFE", label: "生活" },
  { key: "TRANSPORT", label: "交通・移動" },
  { key: "BUSINESS", label: "営業・店舗" },
  { key: "NIGHT", label: "ナイト" },
  { key: "EVENT", label: "イベント" },
  { key: "SYSTEM", label: "制度・重要情報" },
] as const;

const IMPACT_CONFIG = {
  HIGH: {
    label: "影響あり",
    color: "border border-[#f2c6cc] bg-[#fdecef] text-[#8f2730]",
    dot: "bg-[#e53e3e]",
  },
  MEDIUM: {
    label: "少し影響",
    color: "border border-[#f0dfbd] bg-[#fbf4e7] text-[#8b6313]",
    dot: "bg-[#d69e2e]",
  },
  LOW: {
    label: "影響なし",
    color: "border border-[#cbe8d6] bg-[#edf8f1] text-[#2f7f4f]",
    dot: "bg-[#38a169]",
  },
};

const CAT_LABEL: Record<string, string> = {
  LIFE: "生活",
  TRANSPORT: "交通・移動",
  BUSINESS: "営業・店舗",
  NIGHT: "ナイト",
  EVENT: "イベント",
  SYSTEM: "制度・重要情報",
};

export default function NewsListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArticles({
        type: "NEWS",
        published: "true",
        page: String(page),
        limit: "20",
      });
      setArticles(data.items);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filtered =
    activeCategory === "ALL"
      ? articles
      : articles.filter((a) => a.newsCategory === activeCategory);

  const highCount = articles.filter((a) => a.impactLevel === "HIGH").length;
  const mediumCount = articles.filter((a) => a.impactLevel === "MEDIUM").length;
  const lowCount = articles.filter((a) => a.impactLevel === "LOW").length;

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Hero */}
      <div className="px-4 pt-10 pb-4 text-center">
        <h1 className="text-[24px] font-bold text-[#114f9d] md:text-[30px]">
          バンコク最新ニュース（在日日本人向け）
        </h1>
        <p className="mt-2 text-[14px] text-[#555]">
          生活や外出に影響する情報だけを、わかりやすくまとめています
        </p>
      </div>

      <div className="mx-auto w-full max-w-[860px] px-4 pb-14 sm:px-6">
        {/* Impact summary box */}
        <div className="mt-5 rounded-lg border border-[#e2e8f0] px-5 py-4">
          <p className="text-[14px] font-semibold text-[#1a202c]">
            今日のバンコク（ニュース）
          </p>
          <div className="mt-2 flex flex-wrap gap-5">
            {(
              [
                ["HIGH", highCount],
                ["MEDIUM", mediumCount],
                ["LOW", lowCount],
              ] as const
            ).map(([level, count]) => (
              <span
                key={level}
                className="flex items-center gap-1.5 text-[13px] text-[#333]"
              >
                <span
                  className={`h-3 w-3 rounded-full ${IMPACT_CONFIG[level].dot}`}
                />
                {IMPACT_CONFIG[level].label}：{count}件
              </span>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                activeCategory === key
                  ? "bg-[#1d4f95] text-white"
                  : "border border-[#d1d5db] bg-white text-[#374151] hover:border-[#1d4f95]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div className="mt-4 border-t border-[#1d4f95]">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 border-b border-[#1d4f95] py-4 animate-pulse"
              >
                <div className="h-20 w-28 shrink-0 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-[15px] text-[#999]">
              ニュースがありません
            </p>
          ) : (
            filtered.map((article) => {
              const t = article.translations[0];
              const date = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("ja-JP")
                : "";
              const impact = article.impactLevel
                ? IMPACT_CONFIG[article.impactLevel]
                : null;
              const catLabel = article.newsCategory
                ? CAT_LABEL[article.newsCategory]
                : null;

              return (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}`}
                  className="flex gap-4 border-b border-[#1d4f95] py-4 transition hover:bg-[#f9fbff]"
                >
                  <div className="relative h-[88px] w-32 shrink-0 overflow-hidden rounded">
                    <Image
                      src={t?.coverUrl || "/img/temp_p.png"}
                      alt={t?.title || ""}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Meta row: date+area LEFT, badges RIGHT */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[12px] text-[#888]">
                        {date && <span>{date}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {impact && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${impact.color}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${impact.dot}`}
                            />
                            {impact.label}
                          </span>
                        )}
                        {catLabel && (
                          <span className="rounded-full bg-[#eef1f5] px-2.5 py-0.5 text-[11px] font-semibold text-[#334155] whitespace-nowrap">
                            {catLabel}
                          </span>
                        )}
                        {article.tags?.map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="rounded-full bg-[#eef1f5] px-2.5 py-0.5 text-[11px] font-semibold text-[#334155] whitespace-nowrap"
                          >
                            {tag.translations?.[0]?.name || tag.slug}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="mt-1 text-[15px] font-bold leading-snug text-[#1a202c] md:text-[16px]">
                      {t?.title || article.slug}
                    </h3>
                    {t?.excerpt && (
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-[#6b7280]">
                        {t.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-[14px] font-semibold ${
                  page === p
                    ? "border-[#0e4da0] bg-[#0e4da0] text-white"
                    : "border-[#b9c1cf] bg-white text-[#1d2a3f] hover:border-[#0e4da0]"
                }`}
              >
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button
                onClick={() => setPage(page + 1)}
                className="ml-1 text-[15px] font-bold text-[#133b71] hover:text-[#0e4da0]"
              >
                次へ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
