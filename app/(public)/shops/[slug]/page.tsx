import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import ImageGallery from "./ImageGallery";
import { Breadcrumb } from "@/components/public/Breadcrumb";

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

async function getPlaceData(slug: string) {
  const place = await prisma.place.findUnique({
    where: { slug, isVisible: true },
    include: {
      translations: { where: { locale: "ja" } },
      images: { orderBy: { order: "asc" }, take: 8 },
      area: { include: { translations: { where: { locale: "ja" } } } },
      categories: { include: { category: { include: { translations: { where: { locale: "ja" } } } } } },
      scenes: { include: { scene: { include: { translations: { where: { locale: "ja" } } } } } },
      tags: { include: { tag: { include: { translations: { where: { locale: "ja" } } } } } },
    },
  });
  if (!place) return null;

  const areaName = place.area?.translations[0]?.name || "";
  const categoryId = place.categories[0]?.categoryId;

  const [relatedArticles, relatedPlaces] = await Promise.all([
    // Articles mentioning this area or category
    prisma.article.findMany({
      where: {
        published: true,
        translations: { some: { title: { contains: areaName, mode: "insensitive" } } },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      include: { translations: { where: { locale: "ja" } } },
    }),
    // Same area + same category stores
    categoryId && place.areaId ? prisma.place.findMany({
      where: {
        isVisible: true,
        areaId: place.areaId,
        categories: { some: { categoryId } },
        slug: { not: slug },
      },
      take: 4,
      orderBy: { displayPriority: "desc" },
      include: {
        translations: { where: { locale: "ja" } },
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }) : Promise.resolve([]),
  ]);

  return { ...place, relatedArticles, relatedPlaces };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceData(slug);
  if (!place) return { title: "店舗が見つかりません" };

  const t = place.translations[0];
  const name = t?.name || slug;
  const area = place.area?.translations[0]?.name || "";
  const category = place.categories[0]?.category?.translations[0]?.name || "";
  const rawDesc = t?.description?.replace(/<[^>]+>/g, "") || "";

  const title = (place as any).seoTitle || `${name} | ${area || "バンコク"}の${category || "お店"}`;
  const desc = (place as any).seoDescription || `${name}は${area || "バンコク"}にある${category || "お店"}です。 営業時間・料金・写真・アクセスなどの店舗情報を掲載しています。`;

  return {
    title,
    description: desc,
    robots: (place as any).noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: name,
      description: desc,
      ...(place.images[0] && { images: [{ url: place.images[0].url }] }),
    },
    alternates: { canonical: `/shops/${slug}` },
  };
}

export default async function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = await getPlaceData(slug);
  if (!place) notFound();

  const t = place.translations[0];
  const areaName = place.area?.translations[0]?.name || "";
  const areaSlug = place.area?.slug || "";
  const categoryName = place.categories[0]?.category?.translations[0]?.name || "";
  const categorySlug = place.categories[0]?.category?.slug || "";
  const snsLinks = SNS_LINKS.map(s => ({ ...s, url: (place as any)[s.key] as string | null })).filter(s => s.url);
  const relatedArticles = (place as any).relatedArticles || [];
  const relatedPlaces = (place as any).relatedPlaces || [];

  const mapsUrl = (place as any).googleMapsUrl as string | null;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Build Google Maps Embed URL using the Maps Embed API (uses our existing API key).
  // Priority:
  //  1. Extract place_id from stored Google Maps URL → most accurate pin
  //  2. Extract @lat,lng from URL → pin by coordinates
  //  3. Use address as search query → always shows correct zoomed location
  const buildEmbedUrl = (): string | null => {
    if (!apiKey) return null;

    const base = `https://www.google.com/maps/embed/v1`;

    // Priority 1: extract place_id (e.g. 1s0x...: or !1s0x... formats)
    if (mapsUrl) {
      const placeIdMatch =
        mapsUrl.match(/[?&!]1s(0x[0-9a-fA-F]+:[0-9a-fA-F]+)/) ||
        mapsUrl.match(/place_id=([^&]+)/);
      if (placeIdMatch) {
        return `${base}/place?key=${apiKey}&q=place_id:${placeIdMatch[1]}&language=ja&zoom=16`;
      }

      // Priority 2: @lat,lng in the URL
      const coordMatch = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        return `${base}/view?key=${apiKey}&center=${lat},${lng}&zoom=16&maptype=roadmap`;
      }
    }

    // Priority 3: search by address
    if (place.address) {
      const query = encodeURIComponent(place.address);
      return `${base}/place?key=${apiKey}&q=${query}&language=ja&zoom=16`;
    }

    // Priority 4: search by store name
    const storeName = place.translations[0]?.name;
    if (storeName) {
      const query = encodeURIComponent(`${storeName} Bangkok`);
      return `${base}/place?key=${apiKey}&q=${query}&language=ja&zoom=16`;
    }

    return null;
  };

  const mapsEmbed = buildEmbedUrl();

  // Schema.org LocalBusiness
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: t?.name || slug,
    description: t?.description?.replace(/<[^>]+>/g, "").slice(0, 200) || "",
    url: `https://bangkok-days.com/shops/${slug}`,
    ...(place.phone && { telephone: place.phone }),
    ...(place.address && { address: { "@type": "PostalAddress", streetAddress: place.address, addressCountry: "TH" } }),
    ...(place.images[0] && { image: place.images[0].url }),
    ...(place.website && { sameAs: [place.website] }),
  }

  return (
    <div className="w-full bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto w-full max-w-4xl px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 pb-16 sm:pb-20">

        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumb items={[
            { label: "TOP", href: "/" },
            { label: "店舗一覧", href: "/shops" },
            { label: t?.name || slug },
          ]} />
        </div>

        {/* Header */}
        <div className="border-b-4 border-[#004098] pb-3 sm:pb-4 mb-4 sm:mb-6">
          <h1 className="text-[20px] sm:text-[24px] md:text-[28px] font-bold text-[#111] mb-1">
            {(place as any).h1Tag || t?.name || slug}
          </h1>
          <p className="text-[11px] sm:text-[12px] md:text-[13px] text-[#444] mb-2">
            {categoryName}{categoryName && areaName ? " · " : ""}{areaName}
          </p>
          {((place as any).googleRating || (place as any).priceFrom) && (
            <div className="flex items-center gap-3 flex-wrap mb-2">
              {(place as any).googleRating && (
                <span className="flex items-center gap-1 text-[13px] font-bold text-[#333]">
                  <span className="text-[#f6b900]">{"★".repeat(Math.round((place as any).googleRating))}</span>
                  <span>{((place as any).googleRating as number).toFixed(1)}</span>
                  {(place as any).googleReviewCount && (
                    <span className="text-[#999] font-normal">({((place as any).googleReviewCount as number).toLocaleString()})</span>
                  )}
                </span>
              )}
              {(place as any).priceFrom && (
                <span className="text-[12px] text-[#555] font-semibold">
                  {(place as any).priceFrom.toLocaleString()}&#x2013;{(place as any).priceTo ? (place as any).priceTo.toLocaleString() : ""}THB
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {place.tags.map(({ tag }) => (
              <span key={tag.id} className="px-2 py-0.5 bg-[#f0f4f8] text-[#444] text-[11px] rounded border border-[#e0e8f0]">
                {tag.translations[0]?.name || tag.slug}
              </span>
            ))}
          </div>
        </div>

        {/* Image Gallery — max 8 */}
        <ImageGallery
          images={place.images.slice(0, 8).map(i => ({ id: i.id, url: i.url, alt: i.alt }))}
          name={t?.name || slug}
        />

        {/* Description — rich text HTML from Tiptap */}
        {t?.description && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] mb-3 pb-2 border-b-2 border-[#004098]">
              お店について
            </h2>
            <div
              className="text-[13px] sm:text-[14px] text-[#222] leading-relaxed
                [&_strong]:font-bold
                [&_u]:underline
                [&_em]:italic
                [&_p]:mb-3
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                [&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
                [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-2"
              dangerouslySetInnerHTML={{ __html: t.description }}
            />
          </div>
        )}

        {/* 料金システム */}
        {(place as any).price && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] mb-3 pb-2 border-b-2 border-[#004098]">
              料金システム
            </h2>
            <p className="whitespace-pre-line text-[13px] sm:text-[14px] text-[#222] leading-relaxed">{(place as any).price}</p>
          </div>
        )}

        {/* Basic Info */}
        {(place.address || place.nearestStation || place.phone || place.openingHours || place.regularHoliday || place.languages.length > 0 || place.website || (place as any).menu) && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] mb-3 pb-2 border-b-2 border-[#004098]">
              基本情報
            </h2>
            <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
              {(place as any).priceFrom && (
                <InfoRow label="予算の目安">
                  <span className="text-[#222] font-semibold">
                    {(place as any).priceFrom.toLocaleString()}〜{(place as any).priceTo ? `${(place as any).priceTo.toLocaleString()}` : ""}THB
                  </span>
                </InfoRow>
              )}
              {place.address && (
                <>
                  <InfoRow label="住所">
                    <span className="text-[#222]">{place.address}</span>
                  </InfoRow>
                  {mapsUrl && (
                    <InfoRow label="">
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#004098] hover:underline font-semibold text-[12px]">
                        📍 GoogleMapで見る
                      </a>
                    </InfoRow>
                  )}
                </>
              )}
              {place.nearestStation && <InfoRow label="最寄り駅"><span className="text-[#222]">{place.nearestStation}</span></InfoRow>}
              {place.phone && (
                <InfoRow label="電話番号">
                  <a href={`tel:${place.phone}`} className="text-[#004098] hover:underline font-semibold">{place.phone}</a>
                </InfoRow>
              )}
              {place.openingHours && <InfoRow label="営業時間"><span className="whitespace-pre-line text-[#222]">{place.openingHours}</span></InfoRow>}
              {(place as any).menu && <InfoRow label="メニュー"><span className="whitespace-pre-line text-[#222]">{(place as any).menu}</span></InfoRow>}
              {place.regularHoliday && <InfoRow label="定休日"><span className="text-[#222]">{place.regularHoliday}</span></InfoRow>}
              {place.languages.length > 0 && (
                <InfoRow label="言語"><span className="text-[#222]">{place.languages.map(l => LANGUAGE_LABELS[l] || l).join("・")}</span></InfoRow>
              )}
              {place.website && (
                <InfoRow label="Webサイト">
                  <a href={place.website} target="_blank" rel="noopener noreferrer"
                    className="text-[#004098] hover:underline break-all">{place.website}</a>
                </InfoRow>
              )}
            </div>
          </div>
        )}

        {/* SNS */}
        {snsLinks.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] mb-3 pb-2 border-b-2 border-[#004098]">
              SNS
            </h2>
            <div className="flex flex-wrap gap-3">
              {snsLinks.map(s => (
                <a key={s.key} href={s.url!} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-bold hover:opacity-80 transition"
                  style={{ borderColor: s.color, color: s.color }}
                >
                  <span>{s.icon}</span>{s.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Map embed */}
        {mapsEmbed && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] mb-3 pb-2 border-b-2 border-[#004098]">
              アクセス・地図
            </h2>
            <div className="rounded-lg overflow-hidden border border-[#e8e8e8]">
              <iframe
                src={mapsEmbed}
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-[#aaa]">
                © Google Maps
              </p>
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-[#004098] hover:underline font-semibold">
                  Google Mapsで開く →
                </a>
              )}
            </div>
          </div>
        )}


        {/* CTA phone button */}
        {place.phone && (
          <a href={`tel:${place.phone}`}
            className="w-full bg-[#004098] text-white py-3 rounded-lg font-bold text-[13px] sm:text-[14px] mb-6 flex items-center justify-center gap-2 hover:bg-[#003080] transition"
          >
            📞 電話する: {place.phone}
          </a>
        )}

        {/* Related stores — same area + category */}
        {relatedPlaces.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#f0f0f0]">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] mb-4">
              {areaName}{categoryName ? `の${categoryName}` : "の近くの店舗"}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {relatedPlaces.map((p: any) => {
                const pt = p.translations[0];
                return (
                  <Link key={p.id} href={`/shops/${p.slug}`}
                    className="overflow-hidden rounded-lg border border-[#f0f0f0] bg-white hover:shadow-md transition">
                    {p.images[0] && (
                      <div className="relative h-20 w-full">
                        <Image src={p.images[0].url} alt={pt?.name || ""} fill className="object-cover" sizes="200px" />
                      </div>
                    )}
                    <p className="p-2 text-[12px] font-semibold text-[#333] line-clamp-2">{pt?.name || p.slug}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#f0f0f0]">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#111] mb-4">関連ガイド記事</h2>
            <div className="space-y-2">
              {relatedArticles.map((a: any) => {
                const at = a.translations[0];
                return (
                  <Link key={a.slug} href={`/${a.type === "NEWS" ? "news" : "articles"}/${a.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-[#f0f0f0] p-3 hover:bg-[#f8f9fa] transition">
                    {at?.coverUrl && (
                      <div className="relative h-12 w-16 shrink-0 rounded overflow-hidden">
                        <Image src={at.coverUrl} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                    )}
                    <p className="text-[13px] font-semibold text-[#333] line-clamp-2">{at?.title || a.slug}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Internal links */}
        <div className="mt-8 pt-6 border-t border-[#f0f0f0] flex flex-wrap gap-3">
          {areaSlug && (
            <Link href={`/area/${areaSlug}`}
              className="inline-flex items-center gap-1 rounded-full border border-[#004098] px-4 py-2 text-[12px] font-bold text-[#004098] hover:bg-[#004098] hover:text-white transition">
              📍 {areaName}エリアの店舗一覧
            </Link>
          )}
          {categorySlug && (
            <Link href={`/category/${categorySlug}`}
              className="inline-flex items-center gap-1 rounded-full border border-[#004098] px-4 py-2 text-[12px] font-bold text-[#004098] hover:bg-[#004098] hover:text-white transition">
              🏷 {categoryName}の店舗一覧
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row border-b border-[#f0f0f0] last:border-b-0">
      {label && (
        <div className="w-full sm:w-32 bg-[#f5f7fa] px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-[12px] font-bold text-[#333]">
          {label}
        </div>
      )}
      <div className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-[12px] ${!label ? "pl-4 sm:pl-8 bg-[#fafbfc]" : ""}`}>
        {children}
      </div>
    </div>
  );
}
