import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { Breadcrumb } from "@/components/public/Breadcrumb"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "特集・おすすめ記事",
  description: "バンコクのエリア別・カテゴリ別おすすめ店舗特集。日本人向けに厳選した店舗をランキング形式で紹介。",
  alternates: { canonical: "/featured" },
}

export default async function FeaturedListPage() {
  const lists = await prisma.curatedList.findMany({
    where: { published: true },
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { places: true } } },
  })

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <section className="mx-auto max-w-280 px-4 pb-8 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        <div className="mb-4">
          <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "特集" }]} />
        </div>
        <h1 className="text-[34px] font-bold tracking-tight text-[#1653a5] sm:text-[38px]">特集・おすすめ</h1>
        <p className="mt-2 text-[14px] font-semibold text-[#1f3658]">エリア別・カテゴリ別のおすすめ店舗特集</p>
      </section>

      <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
        {lists.length === 0 ? (
          <div className="rounded-xl border border-[#d9e1ed] bg-white p-10 text-center text-[#6a7890]">特集記事はまだありません</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map(list => (
              <Link key={list.id} href={`/curated/${list.slug}`}
                className="overflow-hidden rounded-xl border border-[#d9e1ed] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                {list.coverUrl ? (
                  <div className="relative w-full aspect-video">
                    <Image src={list.coverUrl} alt={list.title} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-[#004098] to-[#1a6fd4] flex items-center justify-center">
                    <span className="text-white/80 text-3xl font-bold">特集</span>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-[17px] font-bold text-[#1a3457]">{list.title}</h2>
                  {list.description && <p className="mt-1 text-[13px] text-[#6a7890] line-clamp-2">{list.description}</p>}
                  <p className="mt-2 text-[12px] text-[#004098] font-semibold">{list._count.places}件掲載</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
