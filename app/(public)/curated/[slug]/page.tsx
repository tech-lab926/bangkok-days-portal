import { notFound } from "next/navigation"
import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { Breadcrumb } from "@/components/public/Breadcrumb"
import { StoreCard } from "./StoreCard"

async function getData(slug: string) {
  return prisma.curatedList.findUnique({
    where: { slug, published: true },
    include: {
      places: {
        orderBy: { order: "asc" },
        include: {
          place: {
            include: {
              translations: { where: { locale: "ja" } },
              images: { orderBy: { order: "asc" }, take: 6 },
              area: { include: { translations: { where: { locale: "ja" } } } },
              categories: { include: { category: { include: { translations: { where: { locale: "ja" } } } } } },
              scenes: { include: { scene: { include: { translations: { where: { locale: "ja" } } } } } },
              tags: { include: { tag: { include: { translations: { where: { locale: "ja" } } } } } },
            },
          },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const list = await getData(slug)
  if (!list) return { title: "ページが見つかりません" }
  const title = list.seoTitle || list.title
  const desc = list.seoDescription || list.description || ""
  return {
    title: `${title} | バンコクデイズ`,
    description: desc,
    openGraph: { title, description: desc, ...(list.coverUrl && { images: [{ url: list.coverUrl }] }) },
    alternates: { canonical: `/curated/${slug}` },
  }
}

export default async function CuratedListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const list = await getData(slug)
  if (!list) notFound()

  return (
    <div className="bg-[#f5f7fa] min-h-screen pb-20">
      {/* Hero */}
      {list.coverUrl && (
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img src={list.coverUrl} alt={list.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-[900px] px-4 sm:px-6 pt-6">
        <Breadcrumb items={[
          { label: "TOP", href: "/" },
          { label: "特集", href: "/featured" },
          { label: list.title },
        ]} />

        <h1 className="text-[26px] sm:text-[32px] font-black text-[#1a2a3a] mt-4 leading-tight">
          {list.title}
        </h1>
        {list.description && (
          <p className="mt-3 text-[14px] text-[#555] leading-relaxed">{list.description}</p>
        )}
        <p className="mt-2 text-[13px] text-[#999]">{list.places.length}件掲載</p>

        <div className="mt-8">
          {list.places.map((cp, i) => (
            <StoreCard key={cp.placeId} place={cp.place} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
