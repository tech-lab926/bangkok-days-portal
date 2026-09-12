"use client";

import { useState } from "react";
import Link from "next/link";

const tabs = [
  { id: "dining", label: "飲食" },
  { id: "relax", label: "リラク・美容" },
  { id: "medical", label: "医療・健康" },
  { id: "living", label: "生活サービス" },
  { id: "tourism", label: "観光・一時滞在" },
];

const categoryData: Record<string, { name: string; color: string; slug: string }[]> = {
  dining: [
    { name: "和食", color: "#8B4513", slug: "washoku" },
    { name: "居酒屋・バー", color: "#B8860B", slug: "izakaya" },
    { name: "ラーメン", color: "#D2691E", slug: "ramen" },
    { name: "カフェ・スイーツ", color: "#CD853F", slug: "cafe" },
    { name: "タイ料理", color: "#DAA520", slug: "thai" },
    { name: "焼肉・ステーキ", color: "#A0522D", slug: "yakiniku" },
    { name: "寿司・海鮮", color: "#2E8B57", slug: "sushi" },
    { name: "イタリアン", color: "#BC8F8F", slug: "italian" },
    { name: "日本語対応", color: "#4682B4", slug: "japanese-ok" },
    { name: "デリバリー対応", color: "#5F9EA0", slug: "delivery" },
    { name: "一人で入りやすい", color: "#6B8E23", slug: "solo-friendly" },
    { name: "駅近", color: "#708090", slug: "near-station" },
  ],
  relax: [
    { name: "マッサージ", color: "#9370DB", slug: "massage" },
    { name: "スパ", color: "#BA55D3", slug: "spa" },
    { name: "美容室", color: "#C71585", slug: "hair-salon" },
    { name: "ネイル", color: "#DB7093", slug: "nail" },
    { name: "エステ", color: "#DDA0DD", slug: "esthetic" },
    { name: "ヨガ・フィットネス", color: "#8B008B", slug: "yoga" },
  ],
  medical: [
    { name: "病院", color: "#DC143C", slug: "hospital" },
    { name: "クリニック", color: "#B22222", slug: "clinic" },
    { name: "歯科", color: "#CD5C5C", slug: "dental" },
    { name: "薬局", color: "#F08080", slug: "pharmacy" },
    { name: "日本語対応", color: "#4682B4", slug: "japanese-ok" },
  ],
  living: [
    { name: "引越し", color: "#2F4F4F", slug: "moving" },
    { name: "不動産", color: "#556B2F", slug: "real-estate" },
    { name: "学校・習い事", color: "#483D8B", slug: "school" },
    { name: "携帯・SIM", color: "#4169E1", slug: "sim" },
    { name: "保険", color: "#6A5ACD", slug: "insurance" },
    { name: "ビザ・法務", color: "#708090", slug: "visa" },
  ],
  tourism: [
    { name: "ホテル", color: "#B8860B", slug: "hotel" },
    { name: "ツアー", color: "#DAA520", slug: "tour" },
    { name: "レンタカー", color: "#808000", slug: "rental-car" },
    { name: "空港送迎", color: "#6B8E23", slug: "airport-transfer" },
  ],
};

export default function CategorySection() {
  const [activeTab, setActiveTab] = useState("dining");

  return (
    <section className="bd-categories" id="category">
      <div className="bd-categories-inner">
        <h2 className="bd-categories-title">カテゴリから探す</h2>

        {/* Tabs */}
        <div className="bd-categories-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`bd-categories-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="bd-categories-grid">
          {(categoryData[activeTab] || []).map((cat) => (
            <Link key={cat.name} className="bd-category-card" href={`/category/${cat.slug}`}>
              <div
                className="bd-category-card-image"
                style={{ background: `linear-gradient(135deg, ${cat.color}88, ${cat.color})` }}
              />
              <span className="bd-category-card-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
