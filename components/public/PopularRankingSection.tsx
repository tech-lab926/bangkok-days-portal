"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getArticles, type Article } from "@/lib/public-api";

export default function PopularRankingSection({ initialData }: { initialData?: Article[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [articles, setArticles] = useState<Article[]>(initialData || []);

  useEffect(() => {
    if (initialData?.length) return;
    getArticles({ type: "GUIDE", published: "true", limit: "5" })
      .then(data => setArticles(data.items))
      .catch(() => {});
  }, [initialData]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || articles.length === 0) return;

    let frameId = 0;

    const updateActiveIndex = () => {
      frameId = 0;
      const left = scroller.scrollLeft;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((node, index) => {
        if (!node) return;
        const distance = Math.abs(node.offsetLeft - left);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateActiveIndex);
    };

    updateActiveIndex();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveIndex);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateActiveIndex);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [articles]);

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    const target = itemRefs.current[index];
    if (!scroller || !target) return;
    scroller.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  };

  if (articles.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-12 md:py-15" id="popular-ranking">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/img/color_bg.jpg')",
          backgroundRepeat: "repeat",
          backgroundPosition: "top center",
          backgroundSize: "auto 100%",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/58" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-360 px-0 sm:px-4 md:px-6">
        <h2 className="text-center text-[30px] font-extrabold tracking-[0.02em] text-[#004098] md:text-[52px]">
          人気ランキング・特集
        </h2>

        <div
          ref={scrollerRef}
          className="mt-8 overflow-x-auto snap-x snap-mandatory pb-2 pl-0.5 pr-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max gap-3.5 md:gap-4">
            {articles.map((article, index) => {
              const t = article.translations[0];
              return (
                <article
                  key={article.slug}
                  ref={(node) => { itemRefs.current[index] = node; }}
                  className="w-60 shrink-0 snap-start md:w-63"
                >
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group block border border-[#e9e9e9] bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl">
                      <Image
                        src={t?.coverUrl || "/img/temp_3.jpg"}
                        alt={t?.title || ""}
                        fill
                        sizes="(max-width: 640px) 240px, (max-width: 1024px) 252px, 252px"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== window.location.origin + "/img/temp_3.jpg") {
                            target.src = "/img/temp_3.jpg";
                          }
                        }}
                      />
                    </div>
                    <h3 className="px-1 pb-3 pt-4 text-center text-[18px] font-extrabold leading-snug text-[#153769] md:text-[19px]">
                      {t?.title || article.slug}
                    </h3>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-7 flex justify-center gap-5">
          {articles.map((article, index) => (
            <button
              key={`${article.slug}-dot`}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`${index + 1}番目のカードへ移動`}
              className={`h-4 w-4 rounded-full transition ${
                activeIndex === index ? "bg-[#0f52aa]" : "bg-[#d2d3d5] hover:bg-[#bcc0c7]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
