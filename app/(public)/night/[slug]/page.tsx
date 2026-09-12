"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPlace, type Place } from "@/lib/public-api";

const LANGUAGE_LABELS: Record<string, string> = {
  ja: "日本語", en: "英語", th: "タイ語", zh: "中国語", ko: "韓国語",
};

const SNS_LINKS = [
  { key: "snsInstagram", label: "Instagram", color: "#E1306C", icon: "📷" },
  { key: "snsX", label: "X (Twitter)", color: "#000", icon: "𝕏" },
  { key: "snsFacebook", label: "Facebook", color: "#1877F2", icon: "f" },
  { key: "snsLine", label: "LINE", color: "#06C755", icon: "L" },
  { key: "snsTiktok", label: "TikTok", color: "#010101", icon: "♪" },
];

export default function NightShopDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getPlace(slug)
      .then(setPlace)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ background: "#0b1929", minHeight: "100vh", padding: "32px 0 80px", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center", paddingTop: 100 }}>
          読み込み中...
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div style={{ background: "#0b1929", minHeight: "100vh", padding: "32px 0 80px", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center", paddingTop: 100 }}>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>店舗が見つかりませんでした</p>
          <Link href="/night" style={{ color: "#6b9fd4" }}>ナイト店舗一覧に戻る</Link>
        </div>
      </div>
    );
  }

  const t = place.translations[0];
  const catName = place.categories[0]?.category.translations[0]?.name || "";
  const images = place.images.length > 0 ? place.images : [{ id: "ph", url: "/img/temp_3.jpg", alt: "", isMain: true, order: 0 }];

  const infoRows = [
    place.address && { label: "住所", value: place.address, pre: false },
    place.nearestStation && { label: "最寄り駅", value: place.nearestStation, pre: false },
    place.phone && { label: "電話番号", value: place.phone, pre: false },
    place.openingHours && { label: "営業時間", value: place.openingHours, pre: true },
    place.regularHoliday && { label: "定休日", value: place.regularHoliday, pre: false },
    place.languages.length > 0 && { label: "言語", value: place.languages.map(l => LANGUAGE_LABELS[l] || l).join("・"), pre: false },
    place.website && { label: "Webサイト", value: place.website, pre: false },
  ].filter(Boolean) as { label: string; value: string; pre: boolean }[];

  const snsLinks = SNS_LINKS.map(s => ({ ...s, url: (place as any)[s.key] })).filter(s => s.url);

  return (
    <div style={{ background: "#0b1929", minHeight: "100vh", padding: "32px 0 80px", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
          <Link href="/" style={{ color: "#6b9fd4", textDecoration: "none" }}>TOP</Link>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
          <Link href="/night" style={{ color: "#6b9fd4", textDecoration: "none" }}>ナイト店舗一覧</Link>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
          <span>{t?.name || place.slug}</span>
        </div>

        {/* Gallery */}
        <div className="mb-8">
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-3">
            <Image src={images[0].url} alt={t?.name || ""} fill className="object-cover" sizes="100vw" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {images.slice(1, 4).map(img => (
                <div key={img.id} className="relative aspect-[16/10] rounded-lg overflow-hidden">
                  <Image src={img.url} alt={img.alt || ""} fill className="object-cover" sizes="33vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          <div>
            {catName && (
              <span className="inline-block bg-[#004098]/85 px-3.5 py-1 rounded text-[13px] font-semibold mb-3">{catName}</span>
            )}
            <h1 className="text-[28px] font-black mb-2">{t?.name || place.slug}</h1>

            <div className="flex gap-2 flex-wrap mb-8">
              {place.tags.map(({ tag }) => (
                <span key={tag.id} className="px-3 py-1 border border-white/20 rounded-full text-[13px] text-white/80">
                  {tag.translations[0]?.name || tag.slug}
                </span>
              ))}
            </div>

            {/* Description */}
            {t?.description && (
              <div className="mb-8">
                <h2 className="text-[18px] font-bold mb-4 pb-2 border-b-2 border-[#004098]">お店について</h2>
                <p className="text-[15px] leading-[1.7] text-white/75 whitespace-pre-line">{t.description}</p>
              </div>
            )}

            {/* Info Table */}
            {infoRows.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[18px] font-bold mb-4 pb-2 border-b-2 border-[#004098]">基本情報</h2>
                <table className="w-full border-collapse">
                  <tbody>
                    {infoRows.map((row, i) => (
                      <tr key={i}>
                        <th className="text-left text-[14px] font-semibold text-white/90 p-3 bg-white/5 w-[100px] border-b border-white/10">{row.label}</th>
                        <td className="text-[14px] text-white/70 p-3 border-b border-white/10">
                          <span className={row.pre ? "whitespace-pre-line" : ""}>{row.value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SNS Links */}
            {snsLinks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[18px] font-bold mb-4 pb-2 border-b-2 border-[#004098]">SNS・公式サイト</h2>
                <div className="flex flex-wrap gap-3">
                  {snsLinks.map(s => (
                    <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-bold hover:opacity-80 transition"
                      style={{ borderColor: s.color, color: s.color }}
                    >
                      <span>{s.icon}</span>{s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="block w-full p-3.5 bg-[#ffc107] text-[#333] rounded-lg text-[15px] font-bold text-center mb-2.5 hover:bg-[#ffb300] transition"
              >
                電話する
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-3.5 border-2 border-white/30 rounded-lg text-[15px] font-bold text-center text-white hover:border-white/60 transition"
              >
                Webサイトを見る
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
