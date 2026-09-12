"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface Area {
  id: string
  name: string
}

interface PlaceItem {
  id: string
  slug: string
  areaId: string
  name: string
  description: string
  imageUrl: string
  areaName: string
}

interface Props {
  areas: Area[]
  places: PlaceItem[]
}

function CategoryAreaFilterInner({ areas, places }: Props) {
  const searchParams = useSearchParams()

  // Initialize from ?areaId= query param (passed e.g. from /area/[slug] category tabs)
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>(() => {
    const areaId = searchParams.get("areaId")
    return areaId ? [areaId] : []
  })

  // Re-sync if the URL query changes (e.g. back/forward navigation)
  useEffect(() => {
    const areaId = searchParams.get("areaId")
    if (areaId) {
      setSelectedAreaIds([areaId])
    }
  }, [searchParams])

  const toggleArea = (id: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const filtered = selectedAreaIds.length === 0
    ? places
    : places.filter(p => selectedAreaIds.includes(p.areaId))

  return (
    <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
      {/* Area filter */}
      {areas.length > 0 && (
        <div className="mb-6 rounded-xl border border-[#d9e1ed] bg-white p-4 shadow-sm">
          <p className="mb-3 text-[13px] font-bold text-[#1b365d]">
            エリアで絞り込む
            <span className="ml-2 text-[11px] font-normal text-[#7a879b]">（複数選択可）</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedAreaIds([])}
              className={`rounded-lg border px-3 py-2 text-[13px] font-semibold transition ${
                selectedAreaIds.length === 0
                  ? "border-[#0f4aa8] bg-[#0f4aa8] text-white"
                  : "border-[#d4dbe6] bg-white text-[#304665] hover:border-[#87a4d1]"
              }`}
            >
              すべて
            </button>
            {areas.map(area => (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleArea(area.id)}
                className={`rounded-lg border px-3 py-2 text-[13px] font-semibold transition ${
                  selectedAreaIds.includes(area.id)
                    ? "border-[#0f4aa8] bg-[#0f4aa8] text-white"
                    : "border-[#d4dbe6] bg-white text-[#304665] hover:border-[#87a4d1]"
                }`}
              >
                {area.name}
              </button>
            ))}
          </div>
          {selectedAreaIds.length > 0 && (
            <p className="mt-2 text-[12px] text-[#6a7890]">
              {filtered.length}件表示中
            </p>
          )}
        </div>
      )}

      {/* Shop grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#d9e1ed] bg-white p-10 text-center text-[#6a7890]">
          このエリアには公開中の店舗がありません
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(place => (
            <Link
              key={place.id}
              href={`/shops/${place.slug}`}
              className="overflow-hidden rounded-xl border border-[#dbe4ee] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-32 w-full">
                <Image src={place.imageUrl} alt={place.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
              </div>
              <div className="p-4">
                {place.areaName && (
                  <p className="inline-block rounded-full bg-[#f3f7fd] px-2.5 py-1 text-[10px] font-semibold text-[#5a6f8f]">{place.areaName}</p>
                )}
                <h2 className="mt-2 text-[16px] font-bold text-[#1a3457]">{place.name}</h2>
                {place.description && (
                  <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-[#334968]">
                    {place.description.replace(/<[^>]+>/g, "")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export function CategoryAreaFilter(props: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8" />}>
      <CategoryAreaFilterInner {...props} />
    </Suspense>
  )
}
