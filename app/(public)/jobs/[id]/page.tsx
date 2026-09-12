import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Building2, ArrowLeft, CalendarDays, Tag } from "lucide-react"

async function getJob(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3010"}/api/v1/jobs/${id}`, { cache: "no-store" })
    const json = await res.json()
    if (!json.success) return null
    return json.data
  } catch { return null }
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJob(id)
  if (!job) notFound()

  const placeName = job.place?.translations?.[0]?.name

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <section className="mx-auto max-w-280 px-4 pb-8 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        <Link href="/jobs" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#1653a5] hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />求人一覧に戻る
        </Link>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1653a5] sm:text-[34px]">{job.title}</h1>
        <p className="mt-1 text-[16px] font-semibold text-[#1f3658]">{job.company}</p>
      </section>

      <section className="mx-auto max-w-280 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#d9e1ed] bg-white overflow-hidden shadow-sm">
          {/* Image */}
          {job.imageUrl && (
            <div className="relative w-full aspect-video">
              <Image src={job.imageUrl} alt={job.title} fill className="object-cover" sizes="800px" priority />
            </div>
          )}

          <div className="p-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {job.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0f4aa8] px-3 py-1 text-[13px] font-bold text-white">
                  <Tag className="h-3.5 w-3.5" />{job.category}
                </span>
              )}
              {job.location && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#d4dbe6] px-3 py-1 text-[13px] text-[#6a7890]">
                  <MapPin className="h-3.5 w-3.5" />{job.location}
                </span>
              )}
              {placeName && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#d4dbe6] px-3 py-1 text-[13px] text-[#6a7890]">
                  <Building2 className="h-3.5 w-3.5" />{placeName}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[13px] text-[#a0a0a0]">
                <CalendarDays className="h-3.5 w-3.5" />{new Date(job.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </div>

            {/* Description */}
            {job.description && (
              <div className="border-t pt-6">
                <h2 className="mb-3 text-[16px] font-bold text-[#1f365d]">求人情報</h2>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#334968]">{job.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
