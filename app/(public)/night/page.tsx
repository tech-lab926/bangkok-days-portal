"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPlaces, type Place } from "@/lib/public-api";

export default function NightShopListPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlaces({ type: "NIGHT", limit: "30" })
      .then(data => setPlaces(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#0b1929", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg, #004098 0%, #0b1929 100%)", padding: "60px 0 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>バンコク夜遊びナビ</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6 }}>
            安全で初心者にもやさしい夜のバンコクを日本語でご案内。厳選されたお店だけを掲載しています。
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
          <Link href="/" style={{ color: "#6b9fd4", textDecoration: "none" }}>TOP</Link>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
          <span>ナイト店舗一覧</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.5)" }}>読み込み中...</div>
        ) : places.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.5)" }}>ナイト店舗がまだ登録されていません</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.map(place => {
              const t = place.translations[0];
              const imageUrl = place.images[0]?.url || "/img/temp_3.jpg";
              const areaName = place.area?.translations[0]?.name || "";
              const catName = place.categories[0]?.category.translations[0]?.name || "";

              return (
                <Link
                  key={place.slug}
                  href={`/night/${place.slug}`}
                  className="block rounded-xl overflow-hidden border border-white/[0.08] bg-[#132640] hover:-translate-y-1 transition-transform"
                >
                  <div className="relative aspect-[16/10]">
                    <Image src={imageUrl} alt={t?.name || ""} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                    {catName && (
                      <span className="absolute top-2.5 left-2.5 bg-[#004098]/85 text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                        {catName}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-[16px] font-bold text-white mb-1.5">{t?.name || place.slug}</h3>
                    <div className="text-[13px] text-[#ffc107] mb-2">
                      {areaName}
                    </div>
                    {t?.description && (
                      <p className="text-[13px] text-white/60 line-clamp-2 leading-relaxed mb-3">{t.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {place.tags.map(({ tag }) => (
                        <span key={tag.id} className="px-2 py-0.5 border border-white/15 rounded text-[11px] text-white/60">
                          {tag.translations[0]?.name || tag.slug}
                        </span>
                      ))}
                    </div>
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
