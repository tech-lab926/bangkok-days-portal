import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { Breadcrumb } from "@/components/public/Breadcrumb"
import { CategoryAreaFilter } from "./CategoryAreaFilter"

async function getCategoryData(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: "ja" } },
      _count: { select: { places: true } },
    },
  })
  if (!category) return null

  const [places, areas] = await Promise.all([
    prisma.place.findMany({
      where: { isVisible: true, categories: { some: { categoryId: category.id } } },
      orderBy: { displayPriority: "desc" },
      include: {
        translations: { where: { locale: "ja" } },
        images: { orderBy: { order: "asc" }, take: 1 },
        area: { include: { translations: { where: { locale: "ja" } } } },
      },
    }),
    prisma.area.findMany({
      where: { places: { some: { categories: { some: { categoryId: category.id } }, isVisible: true } } },
      include: { translations: { where: { locale: "ja" } } },
      orderBy: { displayOrder: "asc" },
    }),
  ])

  return { category, places, areas }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoryData(slug)
  if (!data) return { title: "カテゴリが見つかりません" }

  const name = data.category.translations[0]?.name || slug
  const title = (data.category as any).seoTitle || `バンコクの${name}おすすめ`
  const desc = (data.category as any).seoDescription || `バンコクの${name}を${data.category._count.places}件掲載。日本人向けの${name}をエリア別に探せます。`
  return {
    title,
    description: desc,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title,
      description: desc,
      ...((data.category as any).imageUrl && { images: [{ url: (data.category as any).imageUrl }] }),
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getCategoryData(slug)
  if (!data) notFound()

  const { category, places, areas } = data
  const categoryName = category.translations[0]?.name || slug

  const areaOptions = areas.map(a => ({
    id: a.id,
    name: a.translations[0]?.name || a.slug,
  }))

  const placesData = places.map(place => ({
    id: place.id,
    slug: place.slug,
    areaId: place.areaId || "",
    name: place.translations[0]?.name || place.slug,
    description: place.translations[0]?.description || "",
    imageUrl: place.images[0]?.url || "/img/placeholder.png",
    areaName: place.area?.translations[0]?.name || "",
  }))

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <section className="mx-auto max-w-280 px-4 pb-8 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-[13px] text-[#7a879b]">
          <Breadcrumb items={[
            { label: "TOP", href: "/" },
            { label: "店舗一覧", href: "/shops" },
            { label: categoryName },
          ]} />
        </div>
        <h1 className="text-[34px] font-bold tracking-tight text-[#1653a5] sm:text-[38px]">
          バンコクの{categoryName}
        </h1>
        <p className="mt-2 text-[14px] font-semibold text-[#1f3658]">
          {category._count.places}件掲載中
        </p>
        {(category as any).description && (
          <p className="mt-3 text-[14px] leading-relaxed text-[#334968]">{(category as any).description}</p>
        )}
      </section>

      <CategoryAreaFilter
        areas={areaOptions}
        places={placesData}
      />
    </div>
  )
}
