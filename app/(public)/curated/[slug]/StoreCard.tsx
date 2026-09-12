"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface LightboxProps {
  images: { url: string; alt?: string | null }[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(initialIndex)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button className="absolute right-4 top-4 text-white text-3xl font-bold z-10" onClick={onClose}>✕</button>
      {images.length > 1 && (
        <>
          <button className="absolute left-4 text-white text-4xl z-10 px-2"
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }}>‹</button>
          <button className="absolute right-4 text-white text-4xl z-10 px-2"
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }}>›</button>
        </>
      )}
      <div className="relative max-w-4xl max-h-[85vh] w-full mx-8" onClick={e => e.stopPropagation()}>
        <Image
          src={images[idx].url}
          alt={images[idx].alt || ""}
          width={1200}
          height={800}
          className="object-contain max-h-[85vh] w-full rounded-lg"
        />
        {images.length > 1 && (
          <p className="text-center text-white/60 text-sm mt-2">{idx + 1} / {images.length}</p>
        )}
      </div>
    </div>
  )
}

const SNS_CONFIG = [
  { key: "snsInstagram", label: "Instagram", icon: "📷", color: "#E1306C" },
  { key: "snsLine", label: "LINE", icon: "L", color: "#06C755" },
  { key: "snsFacebook", label: "Facebook", icon: "f", color: "#1877F2" },
  { key: "snsX", label: "X", icon: "𝕏", color: "#000" },
  { key: "snsTiktok", label: "TikTok", icon: "♪", color: "#010101" },
  { key: "website", label: "公式サイト", icon: "🌐", color: "#004098" },
]

interface StoreCardProps {
  place: any
  rank: number
}

export function StoreCard({ place, rank }: StoreCardProps) {
  const [lightbox, setLightbox] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 })
  const t = place.translations?.[0]
  const areaName = place.area?.translations?.[0]?.name || ""
  const categoryName = place.categories?.[0]?.category?.translations?.[0]?.name || ""
  const images = place.images || []
  const tags = place.tags?.map((pt: any) => pt.tag?.translations?.[0]?.name).filter(Boolean) || []

  const rankColors = ["bg-[#f6b900]", "bg-[#9ca3af]", "bg-[#b45309]"]
  const rankColor = rankColors[rank - 1] || "bg-[#6b7280]"

  return (
    <div className="bg-white rounded-xl border border-[#e0e8f0] shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 pb-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] font-bold text-white ${rankColor}`}>
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <Link href={`/shops/${place.slug}`} className="text-[20px] font-bold text-[#1a2a3a] hover:text-[#004098] transition">
            {t?.name || place.slug}
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {categoryName && <span className="bg-[#004098] text-white text-[11px] font-bold px-2.5 py-0.5 rounded">{categoryName}</span>}
            {areaName && <span className="text-[12px] text-[#666]">{areaName}</span>}
            {place.nearestStation && <span className="text-[12px] text-[#666]">🚉 {place.nearestStation} 徒歩2分</span>}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag: string) => (
                <span key={tag} className="text-[11px] bg-[#f0f4f8] text-[#555] px-2 py-0.5 rounded border border-[#e0e8f0]">{tag}</span>
              ))}
            </div>
          )}
        </div>
        {/* Info table */}
        <div className="hidden md:block shrink-0 text-[12px] text-[#444] min-w-[220px]">
          <table className="w-full border-collapse">
            <tbody>
              {(place.priceFrom || place.priceTo || place.price) && (
                <tr>
                  <td className="py-1 pr-3 text-[#004098] whitespace-nowrap align-top font-medium">
                    🪙 予算の目安
                  </td>
                  <td className="py-1 align-top">
                    {place.priceFrom
                      ? `฿${place.priceFrom.toLocaleString()}〜${place.priceTo ? place.priceTo.toLocaleString() : ""}`
                      : place.price?.split("\n")[0].replace(/^#\s*/, "").replace(/THB/g, "฿")}
                  </td>
                </tr>
              )}
              {place.openingHours && (
                <tr>
                  <td className="py-1 pr-3 text-[#004098] whitespace-nowrap align-top font-medium">🕐 営業時間</td>
                  <td className="py-1 align-top whitespace-pre-line">
                    {place.openingHours.split("\n").slice(0, 7).join("\n")}
                  </td>
                </tr>
              )}
              {place.languages?.length > 0 && (
                <tr>
                  <td className="py-1 pr-3 text-[#004098] whitespace-nowrap align-top font-medium">👤 対応言語</td>
                  <td className="py-1 align-top">
                    {place.languages.map((l: string) => ({ ja: "日本語", en: "英語", th: "タイ語" }[l] || l)).join("・")}
                  </td>
                </tr>
              )}
              {place.phone && (
                <tr>
                  <td className="py-1 pr-3 text-[#004098] whitespace-nowrap align-top font-medium">📞 電話番号</td>
                  <td className="py-1 align-top">
                    <a href={`tel:${place.phone}`} className="text-[#004098] hover:underline font-semibold">{place.phone}</a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Images: 1 large left + 2×2 grid right */}
      {images.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex gap-1.5 rounded-lg overflow-hidden" style={{ height: 220 }}>
            {/* Large main image */}
            <div
              className="relative cursor-zoom-in overflow-hidden rounded flex-shrink-0"
              style={{ width: "55%" }}
              onClick={() => setLightbox({ open: true, idx: 0 })}
            >
              <Image src={images[0].url} alt={images[0].alt || t?.name || ""} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="400px" />
            </div>
            {/* 2×2 right grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-2 gap-1.5 flex-1">
                {[1, 2, 3, 4].map((i) => {
                  const img = images[i]
                  if (!img) return <div key={i} className="bg-[#f0f4f8] rounded" />
                  return (
                    <div key={img.id || i}
                      className="relative cursor-zoom-in overflow-hidden rounded"
                      onClick={() => setLightbox({ open: true, idx: i })}
                    >
                      <Image src={img.url} alt={img.alt || t?.name || ""} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="180px" />
                      {i === 4 && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-[16px]">
                          +{images.length - 5}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {t?.description && (
        <div className="px-5 pb-3 text-[13px] text-[#444] leading-relaxed">
          {t.description.replace(/<[^>]+>/g, "").slice(0, 200)}
        </div>
      )}

      {/* Mobile info */}
      <div className="md:hidden px-5 pb-3 text-[12px] text-[#444] space-y-1.5">
        {place.openingHours && <div className="flex gap-2"><span className="text-[#004098]">🕐</span><span className="whitespace-pre-line">{place.openingHours.split("\n").slice(0, 7).join("\n")}</span></div>}
        {(place.priceFrom || place.price) && (
          <div className="flex gap-2">
            <span className="text-[#004098]">🪙</span>
            <span>
              {place.priceFrom
                ? `฿${place.priceFrom.toLocaleString()}〜${place.priceTo ? place.priceTo.toLocaleString() : ""}`
                : place.price?.split("\n")[0].replace(/^#\s*/, "").replace(/THB/g, "฿")}
            </span>
          </div>
        )}
        {place.phone && <div className="flex gap-2"><span className="text-[#004098]">📞</span><a href={`tel:${place.phone}`} className="text-[#004098] font-semibold">{place.phone}</a></div>}
      </div>

      {/* SNS */}
      <div className="px-5 pb-4 flex flex-wrap gap-3">
        {SNS_CONFIG.map(({ key, label, icon, color }) => {
          const val = place[key]
          if (!val) return null
          return (
            <a key={key} href={val} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-semibold hover:opacity-80 transition"
              style={{ color }}>
              <span>{icon}</span>
              <span>{label}</span>
            </a>
          )
        })}
      </div>

      {lightbox.open && (
        <Lightbox images={images} initialIndex={lightbox.idx} onClose={() => setLightbox({ open: false, idx: 0 })} />
      )}
    </div>
  )
}
