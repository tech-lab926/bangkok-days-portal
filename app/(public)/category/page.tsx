import Link from "next/link"
import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { Breadcrumb } from "@/components/public/Breadcrumb"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "カテゴリ一覧",
  description: "バンコクの日本人向け店舗をカテゴリから探せます。居酒屋・バー・マッサージ・クリニックなど。",
  alternates: { canonical: "/category" },
}

export default async function CategoryListPage() {
  const categories = await prisma.category.findMany({
    where: { enabled: true },
    orderBy: { displayOrder: "asc" },
    include: {
      translations: { where: { locale: "ja" } },
      _count: { select: { places: true } },
    },
  })

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <section className="mx-auto max-w-280 px-4 pb-8 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        <div className="mb-4">
          <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "カテゴリ一覧" }]} />
        </div>
        <h1 className="text-[34px] font-bold tracking-tight text-[#1653a5] sm:text-[38px]">カテゴリ一覧</h1>
        <p className="mt-2 text-[14px] font-semibold text-[#1f3658]">カテゴリから店舗を探す</p>
      </section>

      <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(c => (
            <Link key={c.id} href={`/category/${c.slug}`}
              className="rounded-xl border border-[#d9e1ed] bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-[16px] font-bold text-[#1a3457]">{c.translations[0]?.name || c.slug}</p>
              <p className="mt-1 text-[13px] text-[#6a7890]">{c._count.places}件</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
