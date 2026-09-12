import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { Breadcrumb } from "@/components/public/Breadcrumb"
import { MapPin, Phone, Globe, Clock } from "lucide-react"

async function getData(slug: string) {
  const list = await prisma.curatedList.findUnique({
    where: { slug, published: true },
    include: {
      places: {
        orderBy: { order: "asc" },
        include: {
          place: {
            include: {
              translations: { where: { locale: "ja" } },
              images: { orderBy: { order: "asc" }, take: 1 },
              area: { include: { translations: { where: { locale: "ja" } } } },
              categories: { include: { category: { include: { translations: { where: { locale: "ja" } } } } } },
            },
          },
        },
      },
    },
  })
  return list
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const list = await getData(slug)
  if (!list) return { title: "特集ページが見つかりません" }
  return {
    title: list.seoTitle || `${list.title}｜バンコクデイズ`,
    description: list.seoDescription || list.description || undefined,
    alternates: { canonical: `/featured/${slug}` },
    openGraph: {
      title: list.seoTitle || `${list.title}｜バンコクデイズ`,
      description: list.seoDescription || list.description || undefined,
      ...(list.coverUrl && { images: [{ url: list.coverUrl }] }),
    },
  }
}

export default async function FeaturedListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const list = await getData(slug)
  if (!list) notFound()

  // JSON-LD ItemList structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: list.places.map(({ place }: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: place.translations[0]?.name || place.slug,
      url: `https://bangkok-days.com/shops/${place.slug}`,
    })),
  }

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-[#1a3457]">
        {list.coverUrl && (
          <Image src={list.coverUrl} alt={list.title} fill className="object-cover opacity-60" sizes="100vw" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-280 px-4 pb-6 sm:px-6 lg:px-8">
          <div className="mb-2">
            <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: list.title }]} />
          </div>
          <h1 className="text-[26px] font-extrabold text-white sm:text-[34px] drop-shadow">{list.title}</h1>
          <p className="mt-1 text-[13px] text-white/80">{list.places.length}件掲載</p>
        </div>
      </div>

      <div className="mx-auto max-w-280 px-4 py-8 sm:px-6 lg:px-8">
        {list.description && (
          <div className="mb-8 text-[14px] leading-relaxed text-[#334968] max-w-2xl [&_a]:text-[#004098] [&_a]:underline [&_strong]:font-bold [&_p]:mb-3" dangerouslySetInnerHTML={{ __html: list.description }} />
        )}

        <div className="space-y-5">
          {list.places.map(({ place }, i) => {
            const t = place.translations[0]
            const imageUrl = place.images[0]?.url || "/img/placeholder.png"
            const areaName = place.area?.translations[0]?.name || ""
            const catName = place.categories[0]?.category.translations[0]?.name || ""

            return (
              <div key={place.id} className="flex gap-4 rounded-xl border border-[#dbe4ee] bg-white p-4 shadow-sm sm:gap-6 sm:p-5">
                {/* Rank number */}
                <div className="shrink-0 flex items-start pt-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004098] text-[13px] font-extrabold text-white">
                    {i + 1}
                  </span>
                </div>

                {/* Image */}
                <Link href={`/shops/${place.slug}`} className="shrink-0">
                  <div className="relative h-24 w-32 overflow-hidden rounded-lg sm:h-28 sm:w-40">
                    <Image src={imageUrl} alt={t?.name || place.slug} fill className="object-cover" sizes="160px" />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {areaName && (
                      <span className="rounded-full bg-[#f3f7fd] px-2 py-0.5 text-[10px] font-semibold text-[#5a6f8f]">{areaName}</span>
                    )}
                    {catName && (
                      <span className="rounded-full bg-[#fff3e0] px-2 py-0.5 text-[10px] font-semibold text-[#b45309]">{catName}</span>
                    )}
                  </div>
                  <Link href={`/shops/${place.slug}`}>
                    <h2 className="text-[17px] font-bold text-[#1a3457] hover:text-[#004098] transition">{t?.name || place.slug}</h2>
                  </Link>
                  {t?.description && (
                    <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-[#334968]">{(t.description || "").replace(/<[^>]+>/g, "")}</p>
                  )}
                  {/* Store info table */}
                  <div className="mt-3 border border-[#e8e8e8] rounded-lg overflow-hidden text-[12px]">
                    {place.address && (
                      <div className="flex border-b border-[#f0f0f0]">
                        <span className="w-20 shrink-0 bg-[#f5f7fa] px-2 py-1.5 font-bold text-[#333]">住所</span>
                        <span className="flex-1 px-2 py-1.5 text-[#222]">
                          {place.address}
                          {(place as any).googleMapsUrl && (
                            <a href={(place as any).googleMapsUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#004098] hover:underline">【GoogleMap】</a>
                          )}
                        </span>
                      </div>
                    )}
                    {place.phone && (
                      <div className="flex border-b border-[#f0f0f0]">
                        <span className="w-20 shrink-0 bg-[#f5f7fa] px-2 py-1.5 font-bold text-[#333]">電話番号</span>
                        <a href={`tel:${place.phone}`} className="flex-1 px-2 py-1.5 text-[#004098] hover:underline">{place.phone}</a>
                      </div>
                    )}
                    {place.languages && place.languages.length > 0 && (
                      <div className="flex border-b border-[#f0f0f0]">
                        <span className="w-20 shrink-0 bg-[#f5f7fa] px-2 py-1.5 font-bold text-[#333]">言語</span>
                        <span className="flex-1 px-2 py-1.5 text-[#222]">{place.languages.join("・")}</span>
                      </div>
                    )}
                    {place.website && (
                      <div className="flex border-b border-[#f0f0f0]">
                        <span className="w-20 shrink-0 bg-[#f5f7fa] px-2 py-1.5 font-bold text-[#333]">Web</span>
                        <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex-1 px-2 py-1.5 text-[#004098] hover:underline break-all">{place.website}</a>
                      </div>
                    )}
                    {(place.snsInstagram || place.snsX || place.snsFacebook || place.snsLine) && (
                      <div className="flex">
                        <span className="w-20 shrink-0 bg-[#f5f7fa] px-2 py-1.5 font-bold text-[#333]">SNS</span>
                        <div className="flex-1 px-2 py-1.5 flex flex-wrap gap-2">
                          {place.snsInstagram && <a href={place.snsInstagram} target="_blank" rel="noopener noreferrer" className="text-[#004098] hover:underline">Instagram</a>}
                          {place.snsX && <a href={place.snsX} target="_blank" rel="noopener noreferrer" className="text-[#004098] hover:underline">X</a>}
                          {place.snsFacebook && <a href={place.snsFacebook} target="_blank" rel="noopener noreferrer" className="text-[#004098] hover:underline">Facebook</a>}
                          {place.snsLine && <a href={place.snsLine} target="_blank" rel="noopener noreferrer" className="text-[#004098] hover:underline">LINE</a>}
                        </div>
                      </div>
                    )}
                  </div>
                  <Link href={`/shops/${place.slug}`}
                    className="mt-3 inline-block rounded-lg bg-[#004098] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-[#003070] transition">
                    詳細を見る →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
