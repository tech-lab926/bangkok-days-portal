"use client";

import Link from "next/link";
import { useState } from "react";

const searchTags = [
  "マッサージ 日本語",
  "クリニック 子ども",
  "一人で入りやすい店",
  "夜 初心者",
  "SIM",
  "トラブル",
];

export default function HeroSearchBox() {
  const [query, setQuery] = useState("");

  const goSearch = () => {
    const value = query.trim();
    if (!value) return;
    window.location.href = `/shops?q=${encodeURIComponent(value)}`;
  };

  return (
    <div className="mx-auto mt-7 w-full max-w-215 rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.14)] md:mt-8 md:p-5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
        <input
          id="hero-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") goSearch(); }}
          placeholder="店名・サービス・エリア・困りごとで検索"
          className="h-11 flex-1 rounded-lg bg-[#eef1f5] px-4 text-[14px] text-[#1f2937] outline-none placeholder:text-[#949aa6]"
        />
        <button type="button" onClick={goSearch}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0f4aa8] px-5 text-[14px] font-medium text-white sm:w-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
          </svg>
          検索
        </button>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[13px] text-[#8c94a2] md:justify-start">
        <span className="text-[#959ba8]">例：</span>
        {searchTags.map((tag) => (
          <Link key={tag} href={`/shops?q=${encodeURIComponent(tag)}`} className="transition hover:text-[#0f4aa8]">
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
