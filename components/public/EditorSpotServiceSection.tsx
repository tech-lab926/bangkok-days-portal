import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Place } from "@/lib/public-api";

export default function EditorSpotServiceSection({ initialData }: { initialData?: Place[] }) {
  const places = initialData || [];
  if (places.length === 0) return null;

  return (
    <section className="bg-[#efefef] py-11 md:py-14">
      <div className="mx-auto w-full max-w-360 px-4 md:px-6">
        <h2 className="text-center text-[30px] font-extrabold tracking-[0.02em] text-[#004098] md:text-[48px]">
          編集部の注目スポット・サービス
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {places.map((place) => {
            const t = place.translations[0];
            const imageUrl = place.images[0]?.url || "/img/temp_3.jpg";
            const areaName = place.area?.translations[0]?.name || "";
            const catName = place.categories[0]?.category.translations[0]?.name || "";
            return (
              <Link key={place.slug} href={`/shops/${place.slug}`}
                className="group overflow-hidden rounded-lg border border-[#d6dbe3] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image src={imageUrl} alt={t?.name || ""} fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy" />
                </div>
                <div className="flex min-h-37 flex-col p-2.5">
                  {catName && (
                    <span className="inline-flex items-center rounded-md border border-[#d5dae4] bg-[#f5f7fb] px-1.5 py-0.5 text-[10px] font-semibold text-[#4d5b73]">
                      {catName}
                    </span>
                  )}
                  <h3 className="mt-1.5 text-[14px] font-extrabold leading-tight text-[#1f365d]">{t?.name || place.slug}</h3>
                  {t?.description && (
                    <p className="mt-1 text-[11px] leading-[1.35] text-[#838b98] line-clamp-2">{t.description.replace(/<[^>]+>/g, "")}</p>
                  )}
                  {areaName && (
                    <div className="mt-auto flex items-center gap-1 pt-2 text-[11px] text-[#a1a8b5]">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{areaName}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
