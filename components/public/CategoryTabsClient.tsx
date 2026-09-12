"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ChevronRight, HeartPulse, House, Plane, Sparkles, UtensilsCrossed } from "lucide-react";

type TabId = "dining" | "relax" | "medical" | "living" | "tourism";
type CategoryItem = { id: string; name: string; slug: string; placesCount: number };

const tabs = [
  { id: "dining" as TabId, label: "飲食", icon: UtensilsCrossed },
  { id: "relax" as TabId, label: "リラク・美容", icon: Sparkles },
  { id: "medical" as TabId, label: "医療・健康", icon: HeartPulse },
  { id: "living" as TabId, label: "生活サービス", icon: House },
  { id: "tourism" as TabId, label: "観光・一時滞在", icon: Plane },
];

const keywordRules: Record<TabId, string[]> = {
  dining: ["和食","居酒屋","バー","ラーメン","カフェ","スイーツ","焼肉","寿司","thai","ramen","cafe","izakaya","food","restaurant"],
  relax: ["マッサージ","スパ","美容","ネイル","エステ","ヨガ","フィット","massage","spa","beauty","nail","salon","yoga"],
  medical: ["病院","クリニック","歯科","薬局","医療","健康","hospital","clinic","dental","pharmacy","medical","health"],
  living: ["不動産","学校","習い事","携帯","sim","保険","ビザ","法務","引越","delivery","station","生活","service","moving","visa","insurance"],
  tourism: ["ホテル","ツアー","レンタ","空港","観光","滞在","hotel","tour","airport","travel","stay","lounge","esim"],
};

const tabOrder: TabId[] = ["dining","relax","medical","living","tourism"];

const classifyTab = (name: string, slug: string): TabId => {
  const text = `${name} ${slug}`.toLowerCase();
  for (const tab of tabOrder) {
    if (keywordRules[tab].some((k) => text.includes(k.toLowerCase()))) return tab;
  }
  return "living";
};

export default function CategoryTabs({ categories }: { categories: CategoryItem[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("dining");

  const categoryByTab = useMemo(() => {
    const grouped: Record<TabId, CategoryItem[]> = { dining: [], relax: [], medical: [], living: [], tourism: [] };
    for (const c of categories) grouped[classifyTab(c.name, c.slug)].push(c);
    for (const tab of tabOrder) grouped[tab].sort((a, b) => b.placesCount - a.placesCount);
    return grouped;
  }, [categories]);

  return (
    <>
      <div className="mt-7 flex flex-wrap justify-center gap-2 md:mt-9">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-pressed={activeTab === tab.id}
            className={`flex shrink-0 items-center gap-1.5 rounded-sm border px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.id ? "border-[#004098] bg-[#004098] text-white" : "border-[#d8dde7] bg-[#eceff4] text-[#4d5a72] hover:border-[#9db1d0]"}`}>
            <tab.icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:mt-8 md:grid-cols-4 md:gap-3 lg:grid-cols-8">
        {(categoryByTab[activeTab] || []).map((item) => (
          <Link key={item.id} href={`/category/${item.slug}`}
            className="group relative block h-40 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md md:h-44">
            <Image src="/img/res_temp.jpg" alt={item.name} fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy" />
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-2.5 pb-2.5 text-white md:px-3 md:pb-3">
              <span className="text-xs font-bold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] md:text-sm">{item.name}</span>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-90 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
        {!categoryByTab[activeTab]?.length && (
          <div className="col-span-full rounded-xl border border-[#d8dde7] bg-white px-4 py-6 text-center text-sm text-[#67748f]">
            このカテゴリの表示項目はまだありません。
          </div>
        )}
      </div>
    </>
  );
}
