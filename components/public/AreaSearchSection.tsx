"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAreas, type Area } from "@/lib/public-api";

export default function AreaSearchSection({ initialData }: { initialData?: Area[] }) {
  const [areas, setAreas] = useState<Area[]>(initialData || []);

  useEffect(() => {
    if (initialData?.length) return;
    getAreas().then(setAreas).catch(() => {});
  }, [initialData]);

  if (areas.length === 0) return null;

  const featured = areas.slice(0, 3);
  const others = areas.slice(3);

  return (
    <section id="area" className="bg-[#efefef] py-12 md:py-16">
      <div className="mx-auto w-full max-w-250 px-4 md:px-6">
        <h2 className="text-center text-[30px] font-extrabold tracking-[0.02em] text-[#004098] md:text-[44px]">
          エリアから探す
        </h2>

        <div className="mt-7 grid gap-6 md:gap-7 lg:mt-8 lg:grid-cols-3">
          {featured.map((area) => {
            const name = area.translations[0]?.name || area.slug;
            const count = area._count?.places || 0;

            return (
              <Link
                key={area.id}
                href={`/area/${area.slug}`}
                className="group w-full overflow-hidden rounded-2xl border border-[#3e6fbc] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md lg:max-w-76 lg:justify-self-center"
              >
                <div className="relative aspect-4/3">
                  <Image
                    src={area.imageUrl || "/img/placeholder.png"}
                    alt={`${name}の街並み`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />
                </div>

                <div className="flex items-end justify-between gap-3 px-4 py-3.5">
                  <div>
                    <h3 className="text-[26px] font-extrabold leading-none tracking-[0.01em] text-[#0f2f67] md:text-[30px]">
                      {name}
                    </h3>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-[#3f4f65] md:text-base">{count}件</span>
                </div>
              </Link>
            );
          })}
        </div>

        {others.length > 0 && (
          <div className="mt-7 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:mt-8 lg:grid-cols-5 lg:gap-4.5">
            {others.map((area) => {
              const name = area.translations[0]?.name || area.slug;
              const count = area._count?.places || 0;

              return (
                <Link
                  key={area.id}
                  href={`/area/${area.slug}`}
                  className="group relative block h-44 w-full max-w-43 justify-self-center overflow-hidden rounded-xl ring-1 ring-black/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:h-46 sm:max-w-45 lg:h-44"
                >
                  <Image
                    src={area.imageUrl || "/img/placeholder.png"}
                    alt={`${name}のエリア`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-2.5 pb-2 text-white sm:px-3 sm:pb-2.5">
                    <span className="text-xs font-extrabold tracking-[0.01em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] sm:text-sm">
                      {name}
                    </span>
                    <span className="text-[11px] font-semibold text-white/95 sm:text-xs">{count}件</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
