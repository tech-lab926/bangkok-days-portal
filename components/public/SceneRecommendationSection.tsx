"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type SceneItem = {
  id: string;
  slug?: string | null;
  name?: string;
  icon?: string;
  displayOrder: number;
  translations?: Array<{ locale: string; name: string }>;
};

const SCENE_COLORS: Record<number, string> = {
  0: "#3B82F6", 1: "#EC4899", 2: "#22C55E", 3: "#F97316", 4: "#EF4444",
  5: "#C084FC", 6: "#14B8A6", 7: "#7C3AED", 8: "#6366F1", 9: "#FB7185",
};

const SCENE_ICONS: Record<number, string> = {
  0: "/icons/icon-business.png", 1: "/icons/icon-heart.png", 2: "/icons/icon-solo.png",
  3: "/icons/icon-family.png", 4: "/icons/icon-stethoscope.png", 5: "/icons/icon-relax.png",
  6: "/icons/icon-home.png", 7: "/icons/icon-night.png", 8: "/icons/icon-plane.png",
  9: "/icons/icon-couple.png",
};

export default function SceneRecommendationSection({ initialData }: { initialData?: SceneItem[] }) {
  const [scenes, setScenes] = useState<SceneItem[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData?.length) return;
    fetch("/api/v1/scenes?locale=ja")
      .then(r => r.json())
      .then(payload => {
        const list: SceneItem[] = Array.isArray(payload?.data) ? payload.data : [];
        setScenes(list.sort((a, b) => a.displayOrder - b.displayOrder));
      })
      .catch(() => setScenes([]))
      .finally(() => setIsLoading(false));
  }, [initialData]);

  if (isLoading) {
    return (
      <section className="bg-[#d9e3f2] py-9 md:py-11">
        <div className="mx-auto w-full max-w-360 px-4 md:px-6">
          <h2 className="text-center text-[32px] font-extrabold tracking-[0.02em] text-[#004098] md:text-[52px]">シーン別おすすめ</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#d9e3f2] py-9 md:py-11">
      <div className="mx-auto w-full max-w-360 px-4 md:px-6">
        <h2 className="text-center text-[32px] font-extrabold tracking-[0.02em] text-[#004098] md:text-[52px]">シーン別おすすめ</h2>

        <div className="mt-6 grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 md:mt-7 md:gap-4 lg:grid-cols-5">
          {scenes.map((scene, index) => {
            const sceneName = scene.translations?.find(t => t.locale === "ja")?.name || scene.name;
            const color = SCENE_COLORS[index % 10];
            const emoji = scene.icon;
            const iconPath = SCENE_ICONS[index % 10];

            return (
              <Link
                key={scene.id}
                href={scene.slug ? `/scene/${scene.slug}` : `/shops?sceneId=${scene.id}`}
                className="group flex h-32 w-full max-w-48 flex-col items-center justify-center rounded-lg bg-white/95 px-2 py-4 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-[#dfe6f2] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex flex-col items-center gap-3">
                  <span
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    {emoji ? (
                      <span className="text-2xl">{emoji}</span>
                    ) : (
                      <Image src={iconPath} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                    )}
                  </span>
                  <span className="text-[14px] font-bold leading-none text-[#1d3356]">{sceneName}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
