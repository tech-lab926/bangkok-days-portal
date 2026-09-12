import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { Breadcrumb } from "@/components/public/Breadcrumb"

async function getSceneData(slug: string) {
  const scene = await prisma.scene.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: "ja" } },
      _count: { select: { places: true } },
    },
  })
  if (!scene) return null

  const places = await prisma.place.findMany({
    where: { isVisible: true, scenes: { some: { sceneId: scene.id } } },
    take: 24,
    orderBy: { displayPriority: "desc" },
    include: {
      translations: { where: { locale: "ja" } },
      images: { orderBy: { order: "asc" }, take: 1 },
      area: { include: { translations: { where: { locale: "ja" } } } },
      categories: { include: { category: { include: { translations: { where: { locale: "ja" } } } } } },
    },
  })

  return { scene, places }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getSceneData(slug)
  if (!data) return { title: "シーンが見つかりません" }

  const name = data.scene.translations[0]?.name || slug
  const title = `バンコクで${name}におすすめの店舗 | バンコクデイズ`
  const desc = `バンコクで${name}に最適な店舗を${data.scene._count.places}件掲載。日本人向けの${name}向け店舗をエリア別に探せます。`
  return {
    title,
    description: desc,
    alternates: { canonical: `/scene/${slug}` },
    openGraph: { title, description: desc },
  }
}

export default async function ScenePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getSceneData(slug)
  if (!data) notFound()

  const { scene, places } = data
  const sceneName = scene.translations[0]?.name || slug

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <section className="mx-auto max-w-280 px-4 pb-8 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        <div className="mb-4">
          <Breadcrumb items={[
            { label: "TOP", href: "/" },
            { label: "店舗一覧", href: "/shops" },
            { label: sceneName },
          ]} />
        </div>
        <h1 className="text-[34px] font-bold tracking-tight text-[#1653a5] sm:text-[38px]">
          {sceneName}におすすめの店舗
        </h1>
        <p className="mt-2 text-[14px] font-semibold text-[#1f3658]">
          {scene._count.places}件掲載中
        </p>
      </section>

      <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
        {places.length === 0 ? (
          <div className="rounded-xl border border-[#d9e1ed] bg-white p-10 text-center text-[#6a7890]">
            このシーンには公開中の店舗がありません
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => {
              const t = place.translations[0]
              const areaName = place.area?.translations[0]?.name || ""
              const categoryName = place.categories[0]?.category?.translations[0]?.name || ""
              const imageUrl = place.images[0]?.url || "/img/placeholder.png"
              return (
                <Link
                  key={place.id}
                  href={`/shops/${place.slug}`}
                  className="overflow-hidden rounded-xl border border-[#dbe4ee] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-32 w-full">
                    <Image src={imageUrl} alt={t?.name || place.slug} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                  </div>
                  <div className="p-4">
                    <div className="flex gap-1 flex-wrap mb-1">
                      {categoryName && <p className="inline-block rounded-full bg-[#f3f7fd] px-2.5 py-1 text-[10px] font-semibold text-[#5a6f8f]">{categoryName}</p>}
                      {areaName && <p className="inline-block rounded-full bg-[#f3f7fd] px-2.5 py-1 text-[10px] font-semibold text-[#5a6f8f]">{areaName}</p>}
                    </div>
                    <h2 className="mt-1 text-[16px] font-bold text-[#1a3457]">{t?.name || place.slug}</h2>
                    {t?.description && (
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#334968]">
                        {(t.description || "").replace(/<[^>]+>/g, "").slice(0, 80)}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
