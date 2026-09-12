"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Building2, Tag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [filterCategory, setFilterCategory] = useState("__all__")
  const [filterArea, setFilterArea] = useState("__all__")
  const [filterStore, setFilterStore] = useState("__all__")
  const [categories, setCategories] = useState<string[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [stores, setStores] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/jobs").then(r => r.json()),
      fetch("/api/v1/categories?locale=ja").then(r => r.json()),
      fetch("/api/v1/areas?locale=ja").then(r => r.json()),
      fetch("/api/v1/places?limit=100&locale=ja").then(r => r.json()),
    ]).then(([jobsRes, catsRes, areasRes, placesRes]) => {
      const jobData = jobsRes.data || []
      setJobs(jobData)
      setFiltered(jobData)
      setCategories((catsRes.data || []).map((c: any) => c.translations?.[0]?.name || c.slug).filter(Boolean))
      setAreas((areasRes.data || []).map((a: any) => a.translations?.[0]?.name || a.slug).filter(Boolean))
      setStores((placesRes.data?.items || []).map((p: any) => ({ id: p.id, name: p.translations?.[0]?.name || p.slug })))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    let result = jobs
    if (filterCategory !== "__all__") result = result.filter(j => j.category === filterCategory)
    if (filterArea !== "__all__") result = result.filter(j => j.location === filterArea)
    if (filterStore !== "__all__") result = result.filter(j => j.placeId === filterStore)
    setFiltered(result)
  }, [filterCategory, filterArea, filterStore, jobs])

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <section className="mx-auto max-w-280 px-4 pb-8 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        <h1 className="text-[34px] font-bold tracking-tight text-[#1653a5] sm:text-[38px]">求人情報</h1>
        <p className="mt-2 text-[14px] font-semibold text-[#1f3658]">バンコク在住日本人向けの求人情報一覧</p>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-280 px-4 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="カテゴリ（すべて）" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">カテゴリ（すべて）</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="エリア（すべて）" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">エリア（すべて）</SelectItem>
              {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="店舗（すべて）" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">店舗（すべて）</SelectItem>
              {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[#d9e1ed] bg-white p-10 text-center text-[#6a7890]">該当する求人はありません</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="overflow-hidden rounded-xl border border-[#d9e1ed] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                {job.imageUrl && (
                  <div className="relative w-full aspect-video">
                    <Image src={job.imageUrl} alt={job.title} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[14px] text-[#6a7890]">{job.company}</p>
                  <h2 className="mt-1 text-[18px] font-bold leading-tight text-[#1a3457]">{job.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0f4aa8] px-2.5 py-0.5 text-[12px] font-bold text-white">
                        <Tag className="h-3 w-3" />{job.category}
                      </span>
                    )}
                    {job.location && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#d4dbe6] px-2.5 py-0.5 text-[12px] text-[#6a7890]">
                        <MapPin className="h-3 w-3" />{job.location}
                      </span>
                    )}
                    {job.place && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#d4dbe6] px-2.5 py-0.5 text-[12px] text-[#6a7890]">
                        <Building2 className="h-3 w-3" />{job.place.translations?.[0]?.name}
                      </span>
                    )}
                  </div>
                  {job.description && (
                    <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-[#334968]">{job.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

