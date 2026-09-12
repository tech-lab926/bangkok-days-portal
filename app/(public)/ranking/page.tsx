import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { Breadcrumb } from "@/components/public/Breadcrumb"

export const revalidate = 300
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "人気ランキング | バンコクデイズ",
  description: "バンコク在住日本人に人気の店舗ランキング。エリア別・カテゴリ別の人気店をランキング形式で紹介。",
  alternates: { canonical: "/ranking" },
}

// Resolve image + description from the linked URL
async function resolveItemData(url: string) {
  try {
    // /area/[slug]
    const areaMatch = url.match(/^\/area\/([^/?]+)/)
    if (areaMatch) {
      const area = await prisma.area.findUnique({
        where: { slug: areaMatch[1] },
        include: { translations: { where: { locale: "ja" } } },
      })
      if (area) return {
        image: area.imageUrl || null,
        description: area.description || area.translations[0]?.name || null,
      }
    }

    // /category/[slug]
    const catMatch = url.match(/^\/category\/([^/?]+)/)
    if (catMatch) {
      const cat = await prisma.category.findUnique({
        where: { slug: catMatch[1] },
        include: { translations: { where: { locale: "ja" } } },
      })
      if (cat) return {
        image: (cat as any).imageUrl || null,
        description: (cat as any).description || cat.translations[0]?.name || null,
      }
    }

    // /shops/[slug]
    const shopMatch = url.match(/^\/shops\/([^/?]+)/)
    if (shopMatch) {
      const place = await prisma.place.findUnique({
        where: { slug: shopMatch[1] },
        include: {
          translations: { where: { locale: "ja" } },
          images: { orderBy: { order: "asc" }, take: 1 },
        },
      })
      if (place) return {
        image: place.images[0]?.url || null,
        description: place.translations[0]?.description?.replace(/<[^>]+>/g, "").slice(0, 120) || null,
      }
    }
  } catch {}
  return { image: null, description: null }
}

const rankColors = [
  "bg-[#f6b900]", "bg-[#9ca3af]", "bg-[#b45309]",
  "bg-[#6b7280]", "bg-[#6b7280]",
]

export default async function RankingPage() {
  let items: { id: string; title: string; url: string; displayOrder: number }[] = []
  try {
    items = await prisma.featuredPage.findMany({
      where: { enabled: true },
      orderBy: { displayOrder: "asc" },
    })
  } catch {}

  const itemsWithData = await Promise.all(
    items.map(async (item) => ({ ...item, ...(await resolveItemData(item.url)) }))
  )

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <section className="mx-auto max-w-280 px-4 pb-8 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        <div className="mb-4">
          <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "人気ランキング" }]} />
        </div>
        <h1 className="text-[34px] font-bold tracking-tight text-[#1653a5] sm:text-[38px]">人気ランキング</h1>
        <p className="mt-2 text-[14px] font-semibold text-[#1f3658]">バンコク在住日本人に人気の店舗ランキング</p>
      </section>

      <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
        {itemsWithData.length === 0 ? (
          <div className="rounded-xl border border-[#d9e1ed] bg-white p-10 text-center text-[#6a7890]">
            ランキングはまだありません
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itemsWithData.map((item, idx) => (
              <Link
                key={item.id}
                href={item.url}
                className="overflow-hidden rounded-xl border border-[#d9e1ed] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative h-36 w-full bg-gradient-to-br from-[#0f4aa8] to-[#1a6fd4]">
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                  )}
                  <div className="absolute inset-0 bg-[#0a203a]/20" />
                  {/* Rank badge */}
                  <span className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold text-white ${rankColors[idx] ?? "bg-[#6b7280]"}`}>
                    {idx + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-[16px] font-bold text-[#1a3457]">{item.title}</p>
                  {item.description && (
                    <p className="mt-2 text-[12px] leading-relaxed text-[#334968] line-clamp-3">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-3 text-[12px] font-bold text-[#004098]">詳しく見る →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
