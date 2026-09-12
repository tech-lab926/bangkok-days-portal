"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  images: { id: string; url: string; alt: string | null }[];
  name: string;
}

export default function ImageGallery({ images, name }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const imgs = images.length > 0 ? images : [{ id: "ph", url: "/img/placeholder.png", alt: name }];
  const main = imgs[0];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        {imgs.length === 1 ? (
          // Single image — full width
          <div
            className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-[#f0f0f0] bg-[#f5f5f5] cursor-zoom-in"
            onClick={() => setLightboxIdx(0)}
          >
            <Image src={main.url} alt={name} fill sizes="768px" className="object-cover" priority />
          </div>
        ) : (
          // 1 large left + 2×2 right grid (4 images total)
          <div className="flex gap-1.5 sm:gap-2 rounded-lg overflow-hidden" style={{ height: "320px" }}>
            {/* Left — large main */}
            <div
              className="relative rounded-lg overflow-hidden border border-[#f0f0f0] bg-[#f5f5f5] cursor-zoom-in flex-shrink-0"
              style={{ width: "55%" }}
              onClick={() => setLightboxIdx(0)}
            >
              <Image src={main.url} alt={name} fill sizes="400px" className="object-cover" priority />
            </div>

            {/* Right — 2×2 grid */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 flex-1">
              {[1, 2, 3, 4].map((i) => {
                const img = imgs[i];
                if (!img) return <div key={i} className="rounded-lg bg-[#f5f5f5]" />;
                const isLast = i === 4 && imgs.length > 5;
                return (
                  <div
                    key={img.id}
                    className="relative rounded-lg overflow-hidden border border-[#f0f0f0] bg-[#f5f5f5] cursor-zoom-in"
                    onClick={() => setLightboxIdx(i)}
                  >
                    <Image src={img.url} alt={img.alt || ""} fill sizes="180px" className="object-cover" />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">+{imgs.length - 5}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full">
            <Image
              src={imgs[lightboxIdx]?.url || "/img/placeholder.png"}
              alt={name}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-6 flex gap-2">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                className={`w-2 h-2 rounded-full transition ${i === lightboxIdx ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:opacity-70"
            onClick={() => setLightboxIdx(null)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
