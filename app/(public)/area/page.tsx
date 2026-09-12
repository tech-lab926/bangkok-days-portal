"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAreas, getPlaces, type Area, type Place } from "@/lib/public-api";
import AreaMap from "@/components/public/AreaMap";




const getName = (translations: { name?: string }[] = [], fallback = "") =>
  translations[0]?.name || fallback;

export default function Page() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    getAreas()
      .then((data) => {
        setAreas(data);
        setSelectedAreaId(data[0]?.id || "");
      })
      .catch(() => setAreas([]))
      .finally(() => setLoadingAreas(false));
  }, []);

  useEffect(() => {
    if (!selectedAreaId) return;
    setLoadingPlaces(true);
    getPlaces({ areaId: selectedAreaId, limit: "6", page: "1" })
      .then((data) => setPlaces(data.items || []))
      .catch(() => setPlaces([]))
      .finally(() => setLoadingPlaces(false));
  }, [selectedAreaId]);

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || null;
  const areaName = selectedArea
    ? getName(selectedArea.translations, selectedArea.slug)
    : "";

  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  return (
    <div className="bg-[#f0f2f5] text-[#173254]">
      <section className="mx-auto max-w-280 px-4 pb-8 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        <h1 className="text-[34px] font-bold tracking-tight text-[#1653a5] sm:text-[38px]">
          {areaName ? `${areaName}エリア` : "エリアから探す"}
        </h1>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[14px] font-semibold text-[#1f3658] sm:text-[15px]">
            エリアを選んで、日本人向けの人気店舗を探しましょう
          </p>
          <button
            type="button"
            onClick={() => {
              if (!selectedArea) return;
              router.push(`/area/${selectedArea.slug}`);
            }}
            aria-disabled={!selectedArea}
            className={`ml-4 inline-flex items-center gap-2 rounded border border-[#004098] bg-white px-3 py-1.5 text-sm font-bold text-[#004098] transition ${
              selectedArea ? "hover:bg-[#004098] hover:text-white" : "opacity-50"
            }`}
          >
            選択したエリアを見る
          </button>
        </div>
      </section>

      {/* Interactive area map */}
      <section className="mx-auto max-w-280 px-4 pb-6 sm:px-6 lg:px-8">
        <h2 className="text-[17px] font-bold text-[#1c3455] sm:text-[20px] mb-3">エリアマップ</h2>
        <p className="text-[13px] text-[#6a7890] mb-3">地図上のピンをクリックするとエリアページへ移動します</p>
        <AreaMap apiKey={apiKey} />
      </section>

      {/* Area selector */}
      <section className="mx-auto max-w-280 px-4 pb-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#d9e1ed] bg-white p-4 shadow-sm">
          <p className="mb-3 text-[13px] font-bold text-[#1b365d]">
            エリア選択
          </p>
          <div className="flex flex-wrap gap-2">
            {loadingAreas ? (
              <span className="text-[13px] text-[#7a879b]">読み込み中...</span>
            ) : (
              areas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`rounded-lg border px-3 py-2 text-[13px] font-semibold transition ${
                    selectedAreaId === area.id
                      ? "border-[#0f4aa8] bg-[#0f4aa8] text-white"
                      : "border-[#d4dbe6] bg-white text-[#304665] hover:border-[#87a4d1]"
                  }`}
                >
                  {getName(area.translations, area.slug)}
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Hero image */}
      <section className="relative pb-32 sm:pb-20">
        <div className="relative h-56 w-full overflow-hidden sm:h-82.5 lg:h-97.5">
          {selectedArea?.imageUrl ? (
            <Image
              key={selectedArea.id}
              src={selectedArea.imageUrl}
              alt={`${areaName}エリア背景`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0f4aa8] to-[#1a6fd4]" />
          )}
          <div className="absolute inset-0 bg-[#0a203a]/40" />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[55%] z-20 w-full max-w-245 -translate-x-1/2 px-4 sm:top-[72%] sm:px-6 lg:px-8">
          <div className="pointer-events-auto rounded-xl bg-white p-5 shadow-[0_10px_28px_rgba(14,41,78,0.25)] sm:p-7">
            <h2 className="text-center text-[16px] font-bold text-[#223a5b] sm:text-[18px]">
              エリア概要
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-y-4 sm:grid-cols-4 sm:gap-6">
              {[
                { key: "ratingJapanese", label: "日本人の多さ" },
                { key: "ratingNightlife", label: "夜の賑わい" },
                { key: "ratingBeginner", label: "初心者向け" },
                { key: "ratingNightCaution", label: "ナイト注意度" },
              ].map(({ key, label }) => {
                const val =
                  (selectedArea?.[
                    key as keyof typeof selectedArea
                  ] as number) ?? 0;
                return (
                  <div key={key} className="text-center">
                    <p className="text-[12px] text-[#4b5d79]">{label}</p>
                    <p className="mt-1 text-[16px] tracking-[2px] text-[#f6b900]">
                      {"★".repeat(Math.min(5, val))}
                      {"☆".repeat(Math.max(0, 5 - val))}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Shops */}
      <section className="mx-auto max-w-280 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <h3 className="text-[17px] font-bold text-[#1c3455] sm:text-[20px]">
          {areaName ? `${areaName}エリアの人気店舗` : "人気店舗"}
        </h3>

        {loadingPlaces ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-xl border border-[#dbe4ee] bg-white shadow-sm"
              >
                <div className="h-32.5 w-full bg-gray-200" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : places.length === 0 ? (
          <p className="mt-6 text-[14px] text-[#6a7890]">
            このエリアには公開中の店舗がありません。
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => {
              const t = place.translations?.[0];
              const categoryName =
                place.categories?.[0]?.category?.translations?.[0]?.name ||
                "カテゴリ未設定";
              const imageUrl = place.images?.[0]?.url || "/img/temp_3.jpg";
              return (
                <Link
                  key={place.id}
                  href={`/shops/${place.slug}`}
                  className="overflow-hidden rounded-xl border border-[#dbe4ee] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-32.5 w-full">
                    <Image
                      src={imageUrl}
                      alt={t?.name || place.slug}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="inline-block rounded-full bg-[#f3f7fd] px-2.5 py-1 text-[10px] font-semibold text-[#5a6f8f]">
                      {categoryName}
                    </p>
                    <h4 className="mt-2 text-[17px] font-bold text-[#1a3457]">
                      {t?.name || place.slug}
                    </h4>
                    {t?.description && (
                      <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-[#334968]">
                        {t.description.replace(/<[^>]+>/g, "").slice(0, 60)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* "View all shops" CTA button — same width as the 3-column grid */}
        {selectedArea && (
          <div className="mt-8">
            <Link
              href={`/area/${selectedArea.slug}`}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0f4aa8] px-8 py-5 text-[18px] font-bold text-white shadow-lg transition hover:bg-[#0d3f94] hover:shadow-xl hover:-translate-y-0.5 sm:text-[20px]"
            >
              <span>{areaName}エリアの全店舗を見る</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* Popular area ranking */}
      <section className="mx-auto max-w-280 px-4 pb-8 sm:px-6 lg:px-8">
        <h3 className="text-[17px] font-bold text-[#1c3455] sm:text-[20px] mb-4">人気エリアランキング</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {[...areas]
            .sort((a, b) => (b._count?.places || 0) - (a._count?.places || 0))
            .slice(0, 5)
            .map((area, idx) => {
              const name = getName(area.translations, area.slug);
              const rankColors = ["bg-[#f6b900]", "bg-[#9ca3af]", "bg-[#b45309]", "bg-[#6b7280]", "bg-[#6b7280]"];
              return (
                <Link
                  key={area.id}
                  href={`/area/${area.slug}`}
                  className="flex-1 flex items-center gap-3 rounded-xl border border-[#dbe4ee] bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${rankColors[idx]}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a3457]">{name}</p>
                    <p className="text-[11px] text-[#6a7890]">{area._count?.places || 0}件</p>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* All area cards */}
      <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
        <h3 className="text-[17px] font-bold text-[#1c3455] sm:text-[20px] mb-4">エリア一覧</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {areas.map((area) => {
            const name = getName(area.translations, area.slug);
            return (
              <Link
                key={area.id}
                href={`/area/${area.slug}`}
                className="overflow-hidden rounded-xl border border-[#dbe4ee] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
              >
                <div className="relative h-24 w-full">
                  {area.imageUrl ? (
                    <Image src={area.imageUrl} alt={name} fill className="object-cover" sizes="300px" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0f4aa8] to-[#1a6fd4]" />
                  )}
                  <div className="absolute inset-0 bg-[#0a203a]/30" />
                  <p className="absolute bottom-2 left-3 text-[13px] font-bold text-white drop-shadow">{name}</p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] text-[#6a7890]">{area._count?.places || 0}件の店舗</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Night info */}
      <section className="bg-[#051a3f] py-10 sm:py-12">
        <div className="mx-auto max-w-280 px-4 sm:px-6 lg:px-8">
          <h3 className="text-[20px] font-bold text-white">
            {areaName ? `${areaName}エリアの夜情報` : "夜情報"}
          </h3>
          <p className="mt-1 text-[13px] text-[#c4d8ff]">
            安心して楽しむためのポイント
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-[#1a4fa3] p-4 text-[#dce7ff]">
              <p className="text-[14px] font-bold">⚠ 初心者向け注意点</p>
              <ul className="mt-2 space-y-1 text-[12px] leading-relaxed">
                <li>・路地への一人歩きは避け、タクシーやBTSを利用しましょう</li>
                <li>
                  ・Tシャツ+ショートパンツでも、入店時に服装確認しましょう
                </li>
                <li>・日本語対応店舗にも、事前に公式SNSで営業を確認</li>
                <li>
                  ・夜中まで遊ぶときは、知らない方から飲み物を受け取らないこと
                </li>
              </ul>
            </div>
            <div className="rounded-xl bg-[#1a4fa3] p-4 text-[#dce7ff]">
              <p className="text-[14px] font-bold">💡 安心ポイント</p>
              <ul className="mt-2 space-y-1 text-[12px] leading-relaxed">
                <li>・日本人スタッフのいる店舗が多く、言葉の心配が少ない</li>
                <li>・BTS駅周辺は深夜でも人通りがあり比較的安全</li>
                <li>・24時間営業のコンビニやドラッグストアが充実</li>
                <li>・駅前や交差点など、トラブル時の対応がスムーズ</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
