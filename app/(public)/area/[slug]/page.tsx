import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Breadcrumb } from "@/components/public/Breadcrumb";

const RATING_LABELS = [
  { key: "ratingJapanese", label: "日本人の多さ" },
  { key: "ratingNightlife", label: "夜の賑わい" },
  { key: "ratingBeginner", label: "初心者向け" },
  { key: "ratingNightCaution", label: "ナイト注意度" },
];

async function getAreaData(slug: string) {
  const area = await prisma.area.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: "ja" } },
      _count: { select: { places: true } },
    },
  });
  if (!area) return null;

  const [places, articles, nearbyAreas, areaCategories] = await Promise.all([
    prisma.place.findMany({
      where: { areaId: area.id, isVisible: true },
      take: 20,
      orderBy: { displayPriority: "desc" },
      include: {
        translations: { where: { locale: "ja" } },
        images: { orderBy: { order: "asc" }, take: 1 },
        categories: {
          include: { category: { include: { translations: { where: { locale: "ja" } } } } },
        },
      },
    }),
    prisma.article.findMany({
      where: {
        published: true,
        translations: {
          some: {
            OR: [
              { title: { contains: area.translations[0]?.name || slug, mode: "insensitive" } },
              { content: { contains: area.translations[0]?.name || slug, mode: "insensitive" } },
            ]
          }
        }
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      include: { translations: { where: { locale: "ja" } } },
    }).then(results => results.length > 0 ? results :
      prisma.article.findMany({
        where: { published: true },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { translations: { where: { locale: "ja" } } },
      })
    ),
    // Nearby areas (by display order proximity)
    prisma.area.findMany({
      where: { enabled: true, slug: { not: slug } },
      take: 4,
      orderBy: { displayOrder: "asc" },
      include: { translations: { where: { locale: "ja" } } },
    }),
    // Categories used in this area
    prisma.category.findMany({
      where: {
        enabled: true,
        places: { some: { place: { areaId: area.id, isVisible: true } } },
      },
      include: { translations: { where: { locale: "ja" } } },
    }),
  ]);

  return { area, places, articles, nearbyAreas, areaCategories };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAreaData(slug);
  if (!data) return { title: "エリアが見つかりません" };

  const { area } = data;
  const name = area.translations[0]?.name || slug;
  const title = (area as any).seoTitle || `${name}エリアの日本人向け店舗一覧 | バンコクデイズ`;
  const desc = (area as any).seoDescription || area.description || `バンコク${name}エリアの日本人向け店舗・レストラン・バー情報。${area._count.places}件掲載中。`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      ...(area.imageUrl && { images: [{ url: area.imageUrl }] }),
    },
    alternates: { canonical: `/area/${slug}` },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getAreaData(slug);
  if (!data) notFound();

  const { area, places, articles, nearbyAreas, areaCategories } = data as any;
  const areaName = area.translations[0]?.name || slug;
  const storeCount = area._count.places;

  // Build Google Maps Embed API v1 URL for the area map
  const buildAreaEmbedUrl = (): string | null => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;
    const base = `https://www.google.com/maps/embed/v1`;
    const mapsUrl: string | undefined = area.googleMapsUrl;

    if (mapsUrl) {
      // Priority 1: extract place_id from URL
      const placeIdMatch =
        mapsUrl.match(/[?&!]1s(0x[0-9a-fA-F]+:[0-9a-fA-F]+)/) ||
        mapsUrl.match(/place_id=([^&]+)/);
      if (placeIdMatch) {
        return `${base}/place?key=${apiKey}&q=place_id:${placeIdMatch[1]}&language=ja&zoom=15`;
      }

      // Priority 2: extract @lat,lng coordinates
      const coordMatch = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `${base}/view?key=${apiKey}&center=${coordMatch[1]},${coordMatch[2]}&zoom=15&maptype=roadmap`;
      }
    }

    // Priority 3: search by area name
    const query = encodeURIComponent(`${areaName} Bangkok`);
    return `${base}/place?key=${apiKey}&q=${query}&language=ja&zoom=14`;
  };

  const areaEmbedUrl = buildAreaEmbedUrl();

  return (
    <div className="bg-[#f0f2f5] text-[#173254]">
      {/* Hero */}
      <section className="relative h-56 w-full overflow-hidden sm:h-72">
        {area.imageUrl ? (
          <Image src={area.imageUrl} alt={areaName} fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#0f4aa8] to-[#1a6fd4]" />
        )}
        <div className="absolute inset-0 bg-[#0a203a]/50" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <h1 className="text-[32px] font-bold text-white sm:text-[40px]">{areaName}</h1>
          <p className="mt-1 text-[14px] text-white/80">{storeCount}件の店舗</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-280 px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: "TOP", href: "/" },
          { label: "エリア一覧", href: "/area" },
          { label: areaName },
        ]} />
      </div>

      {/* Description + Ratings */}
      {(area.description || (area as any).btsStation || RATING_LABELS.some(r => (area as any)[r.key] > 0)) && (
        <section className="mx-auto max-w-280 px-4 pb-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-[#d9e1ed] bg-white p-5 shadow-sm sm:p-7">
            {(area as any).btsStation && (
              <p className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#1653a5]">
                🚉 {(area as any).btsStation}
              </p>
            )}
            {area.description && (
              <p className="mb-5 text-[14px] leading-relaxed text-[#334968]">{area.description}</p>
            )}
            {RATING_LABELS.some(r => (area as any)[r.key] > 0) && (
              <>
                <h2 className="mb-4 text-center text-[15px] font-bold text-[#223a5b]">エリア概要</h2>
                <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4 sm:gap-6">
                  {RATING_LABELS.map(({ key, label }) => {
                    const val = (area as any)[key] as number ?? 0;
                    return (
                      <div key={key} className="text-center">
                        <p className="text-[12px] text-[#4b5d79]">{label}</p>
                        <p className="mt-1 text-[16px] tracking-[2px] text-[#f6b900]">
                          {"★".repeat(Math.min(5, val))}{"☆".repeat(Math.max(0, 5 - val))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Google Map embed */}
      {areaEmbedUrl && (
        <section className="mx-auto max-w-280 px-4 pb-6 sm:px-6 lg:px-8">
          <div className="rounded-xl overflow-hidden border border-[#d9e1ed] shadow-sm relative">
            <iframe
              src={areaEmbedUrl}
              width="100%" height="300" style={{ border: 0 }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
            {(area as any).googleMapsUrl && (
              <a href={(area as any).googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-md bg-white/90 px-3 py-1.5 text-sm font-semibold text-[#1a73e8] shadow hover:bg-white transition">
                マップで開く
              </a>
            )}
          </div>
        </section>
      )}

      {/* Category filter + Stores */}
      <section className="mx-auto max-w-280 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h2 className="text-[17px] font-bold text-[#1c3455] sm:text-[20px]">
          {areaName}エリアの店舗
        </h2>

        {/* Category tabs — link to /category/[slug]?areaId=xxx so the category page pre-filters by this area */}
        {areaCategories && areaCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/area/${slug}`}
              className="rounded-full border px-3 py-1 text-[12px] font-semibold transition border-[#d4dbe6] bg-white text-[#304665] hover:border-[#004098] hover:text-[#004098]">
              すべて表示
            </Link>
            {areaCategories.map((cat: any) => (
              <Link key={cat.id} href={`/category/${cat.slug}?areaId=${area.id}`}
                className="rounded-full border px-3 py-1 text-[12px] font-semibold transition border-[#d4dbe6] bg-white text-[#304665] hover:border-[#004098] hover:text-[#004098]">
                {cat.translations[0]?.name || cat.slug}
              </Link>
            ))}
          </div>
        )}

        {places.length === 0 ? (
          <p className="mt-6 text-[14px] text-[#6a7890]">このエリアには公開中の店舗がありません。</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place: any) => {
              const t = place.translations[0];
              const categoryName = place.categories[0]?.category?.translations[0]?.name || "";
              const imageUrl = place.images[0]?.url || "/img/placeholder.png";
              return (
                <Link key={place.id} href={`/shops/${place.slug}`}
                  className="overflow-hidden rounded-xl border border-[#dbe4ee] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative h-32 w-full">
                    <Image src={imageUrl} alt={t?.name || place.slug} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                  </div>
                  <div className="p-4">
                    {categoryName && <p className="inline-block rounded-full bg-[#f3f7fd] px-2.5 py-1 text-[10px] font-semibold text-[#5a6f8f]">{categoryName}</p>}
                    <h3 className="mt-2 text-[16px] font-bold text-[#1a3457]">{t?.name || place.slug}</h3>
                    {t?.description && (
                      <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-[#334968]">{t.description.replace(/<[^>]+>/g, "").slice(0, 100)}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Listing banner */}
      <section className="mx-auto max-w-280 px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#004098] p-5 text-center text-white sm:p-6">
          <p className="text-[15px] font-bold">{areaName}で店舗を運営中の方へ</p>
          <p className="mt-1 text-[13px] text-white/80">無料掲載受付中 ── バンコクデイズに店舗情報を掲載しませんか？</p>
          <Link href="/listing" className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-[13px] font-bold text-[#004098] hover:bg-[#f0f4f8] transition">
            掲載申し込み →
          </Link>
        </div>
      </section>

      {/* Nearby areas */}
      {nearbyAreas && nearbyAreas.length > 0 && (
        <section className="mx-auto max-w-280 px-4 pb-8 sm:px-6 lg:px-8">
          <h2 className="text-[15px] font-bold text-[#1c3455] mb-4">近隣エリア</h2>
          <div className="flex flex-wrap gap-2">
            {nearbyAreas.map((a: any) => (
              <Link key={a.id} href={`/area/${a.slug}`}
                className="rounded-full border border-[#004098] px-4 py-2 text-[13px] font-bold text-[#004098] hover:bg-[#004098] hover:text-white transition">
                {a.translations[0]?.name || a.slug}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related articles */}
      {articles.length > 0 && (
        <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="text-[17px] font-bold text-[#1c3455] sm:text-[20px] mb-6">関連記事</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {articles.map((a: any) => {
              const at = a.translations[0]
              return (
                <Link key={a.slug} href={a.type === "NEWS" ? `/news/${a.slug}` : `/articles/${a.slug}`}
                  className="rounded-xl border border-[#dbe4ee] bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition">
                  {at?.coverUrl && (
                    <div className="relative h-28 w-full rounded-lg overflow-hidden mb-3">
                      <Image src={at.coverUrl} alt={at.title || ""} fill className="object-cover" sizes="300px" />
                    </div>
                  )}
                  <p className="text-[13px] font-bold text-[#1a3457] line-clamp-2">{at?.title || a.slug}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  );
}
