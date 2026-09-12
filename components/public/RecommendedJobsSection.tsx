"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";

type JobItem = {
  id: string;
  title: string;
  company?: string;
  category?: string;
  location?: string;
  imageUrl?: string;
  description?: string;
  place?: { translations?: Array<{ name?: string }> };
};

export default function RecommendedJobsSection({ initialData }: { initialData?: JobItem[] }) {
  const [jobs, setJobs] = useState<JobItem[]>(initialData || []);

  useEffect(() => {
    if (initialData?.length) return;
    fetch("/api/v1/jobs").then(r => r.json()).then(d => setJobs((d.data || []).slice(0, 6))).catch(() => {});
  }, [initialData]);

  if (jobs.length === 0) return null;

  return (
    <section className="bg-[#efefef] py-12 md:py-16" id="jobs">
      <div className="mx-auto w-full max-w-360 px-4 md:px-6">
        <h2 className="text-center text-[32px] font-extrabold tracking-[0.02em] text-[#004098] md:text-[50px]">
          バンコクおすすめ日本人求人情報
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="overflow-hidden rounded-xl border border-[#d8d8d8] bg-white shadow-[0_2px_0_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-md block">
              {job.imageUrl && (
                <div className="relative w-full aspect-video">
                  <Image src={job.imageUrl} alt={job.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                </div>
              )}
              <div className="p-4">
              <p className="text-[16px] text-[#666]">{job.company}</p>
              <h3 className="mt-2 text-[20px] font-bold leading-tight text-[#1f365d]">{job.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {job.category && (
                  <span className="inline-flex items-center rounded-full bg-[#3b82f6] px-2.5 py-0.5 text-[13px] font-bold text-white">
                    {job.category}
                  </span>
                )}
                {job.location && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d9d9d9] px-2.5 py-0.5 text-[13px] text-[#9a9a9a]">
                    <MapPin className="h-3.5 w-3.5" />{job.location}
                  </span>
                )}
                {job.place && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d9d9d9] px-2.5 py-0.5 text-[13px] text-[#9a9a9a]">
                    <Building2 className="h-3.5 w-3.5" />{job.place.translations?.[0]?.name}
                  </span>
                )}
              </div>
              {job.description && (
                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-[#555]">{job.description}</p>
              )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/jobs" className="inline-block rounded-full bg-[#004098] px-8 py-3 text-[15px] font-bold text-white hover:bg-[#003070]">
            求人情報をもっと見る
          </Link>
        </div>
      </div>
    </section>
  );
}
