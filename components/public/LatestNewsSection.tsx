"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Article } from "@/lib/public-api";

export default function LatestNewsSection({ initialData }: { initialData?: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialData || []);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || articles.length === 0) return;

    let frameId = 0;
    const update = () => {
      frameId = 0;
      const left = scroller.scrollLeft;
      let closest = 0;
      let minDist = Infinity;
      itemRefs.current.forEach((node, i) => {
        if (!node) return;
        const d = Math.abs(node.offsetLeft - left);
        if (d < minDist) { minDist = d; closest = i; }
      });
      setActiveIndex(closest);
    };
    const onScroll = () => { if (!frameId) frameId = requestAnimationFrame(update); };
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [articles]);

  const scrollTo = (index: number) => {
    const scroller = scrollerRef.current;
    const target = itemRefs.current[index];
    if (!scroller || !target) return;
    scroller.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  };

  if (articles.length === 0) return null;

  return (
    <section id="news" className="bg-[#eff1f4] py-12 md:py-16">
      <div className="mx-auto w-full max-w-360 px-4 md:px-6">
        <h2 className="text-center text-[30px] font-extrabold tracking-[0.02em] text-[#004098] md:text-[44px]">
          バンコク最新ニュース
        </h2>

        <div
          ref={scrollerRef}
          className="mt-8 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max gap-3 md:gap-4">
            {articles.map((article, index) => {
              const t = article.translations[0];
              const date = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("ja-JP")
                : "";
              return (
                <article
                  key={article.slug}
                  ref={(node) => { itemRefs.current[index] = node; }}
                  className="w-52 shrink-0 snap-start sm:w-56"
                >
                  <Link
                    href={`/news/${article.slug}`}
                    className="group block overflow-hidden rounded-lg border border-[#d6dbe4] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={t?.coverUrl || "/img/temp_p.png"}
                        alt={t?.title || ""}
                        fill
                        sizes="224px"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== window.location.origin + "/img/temp_p.png") {
                            target.src = "/img/temp_p.png";
                          }
                        }}
                      />
                      {article.featured && (
                        <span className="absolute left-2 top-2 inline-flex items-center rounded-md bg-[#004098] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm">
                          注目
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 p-2.5">
                      <h3 className="line-clamp-2 text-[13px] font-bold leading-[1.35] text-[#1f2937]">
                        {t?.title || article.slug}
                      </h3>
                      {date && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#7a8190]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {date}
                        </span>
                      )}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="mt-5 flex justify-center gap-4">
          {articles.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`${index + 1}番目`}
              className={`h-3.5 w-3.5 rounded-full transition ${
                activeIndex === index ? "bg-[#0f52aa]" : "bg-[#d2d3d5] hover:bg-[#bcc0c7]"
              }`}
            />
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-[#004098] bg-white px-5 py-2.5 text-sm font-bold text-[#004098] transition hover:bg-[#004098] hover:text-white"
          >
            もっと見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
