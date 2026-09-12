import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Place } from "@/lib/public-api";

export default function NightlifeSection({ initialData }: { initialData?: Place[] }) {
  const places = initialData || [];
  if (places.length === 0) return null;

  return (
    <section className="border-t-2 border-[#1a7ad1] bg-[#1857bb] py-14 md:py-16" id="night">
      <div className="mx-auto w-full max-w-360 px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-[34px] font-extrabold tracking-[0.02em] text-white md:text-[56px]">バンコク夜遊びナビ</h2>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[20px] font-semibold text-white/95 md:text-[31px]">
            <span className="text-[#facc15]">＼</span>
            <span>初心者OK・安心安全なお店をご紹介</span>
            <span className="text-[#facc15]">／</span>
          </p>
        </div>
        <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {places.map((place) => {
            const t = place.translations[0];
            const imageUrl = place.images[0]?.url || "/img/temp_3.jpg";
            const areaName = place.area?.translations[0]?.name || "";
            const catName = place.categories[0]?.category.translations[0]?.name || "";
            return (
              <Link key={place.slug} href={`/night/${place.slug}`}
                className="group overflow-hidden rounded-xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)] ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative h-34 overflow-hidden">
                  <Image src={imageUrl} alt={t?.name || ""} fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/20 to-transparent" />
                  <div className="absolute left-2 top-2 rounded-full bg-[#22c55e] px-2 py-0.5 text-[11px] font-bold text-white">認証済み</div>
                  {catName && (
                    <div className="absolute right-2 top-2 rounded-full bg-[#5b68e7] px-2 py-0.5 text-[11px] font-bold text-white">{catName}</div>
                  )}
                </div>
                <div className="flex min-h-30 flex-col p-3">
                  <h3 className="text-[18px] font-extrabold leading-tight text-[#19345f]">{t?.name || place.slug}</h3>
                  {t?.description && (
                    <p className="mt-1 text-[14px] leading-snug text-[#7c8594] line-clamp-2">{t.description.replace(/<[^>]+>/g, "")}</p>
                  )}
                  {areaName && (
                    <div className="mt-auto flex items-center gap-1.5 pt-2 text-[14px] text-[#a2a9b5]">
                      <MapPin className="h-4 w-4" /><span>{areaName}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-9 flex justify-center">
          <Link href="/night"
            className="inline-flex min-w-38 items-center justify-center rounded-full bg-[#facc15] px-8 py-2.5 text-[18px] font-extrabold text-[#111827] transition hover:brightness-95">
            もっと見る
          </Link>
        </div>
      </div>
    </section>
  );
}
