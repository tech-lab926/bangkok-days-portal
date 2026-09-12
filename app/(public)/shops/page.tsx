"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPlaces, getAreas, getCategories, getScenes, type Place, type Area, type Category, type Scene } from "@/lib/public-api";

export default function ShopListPage() {
  return (
    <Suspense fallback={<div className="w-full bg-[#f8f9fa] min-h-screen" />}>
      <ShopListContent />
    </Suspense>
  );
}

function ShopListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── URLクエリパラメータを正とする（スラッグ・ID両対応）────────────────
  // フィルター状態はすべてURLから読み取る。ブラウザバック時も自動復元される。
  const areaSlugParam    = searchParams.get("area")     || "";
  const catSlugParam     = searchParams.get("category") || "";
  const sceneSlugParam   = searchParams.get("scene")    || "";
  const searchQueryParam = searchParams.get("q")        || "";
  const sortByParam      = searchParams.get("sortBy")   || "displayPriority";
  const pageParam        = Math.max(1, Number(searchParams.get("page")) || 1);

  // スラッグ → ID の変換結果（データロード後に決まる）
  const [resolvedAreaId,     setResolvedAreaId]     = useState("");
  const [resolvedCategoryId, setResolvedCategoryId] = useState("");
  const [resolvedSceneId,    setResolvedSceneId]    = useState("");
  const [masterLoaded,       setMasterLoaded]       = useState(false);

  // マスターデータを1回だけ取得し、URLスラッグ→IDを解決する
  useEffect(() => {
    Promise.all([getAreas(), getCategories(), getScenes()]).then(([a, c, s]) => {
      setAreas(a);
      setCategories(c);
      setScenes(s);
      if (areaSlugParam)  { const f = a.find((x: Area)     => x.slug === areaSlugParam);  if (f) setResolvedAreaId(f.id); }
      if (catSlugParam)   { const f = c.find((x: Category) => x.slug === catSlugParam);   if (f) setResolvedCategoryId(f.id); }
      if (sceneSlugParam) { const f = (s as any[]).find((x: any) => x.slug === sceneSlugParam); if (f) setResolvedSceneId(f.id); }
      setMasterLoaded(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ。以後はURL変化 → fetchPlaces で反応

  // URLスラッグが変わったら解決IDも更新（ブラウザバック / 進む 対応）
  useEffect(() => {
    if (!masterLoaded) return;
    setResolvedAreaId(     areaSlugParam  ? (areas.find(a => a.slug === areaSlugParam)?.id  || "") : "");
    setResolvedCategoryId( catSlugParam   ? (categories.find(c => c.slug === catSlugParam)?.id   || "") : "");
    setResolvedSceneId(    sceneSlugParam ? ((scenes as any[]).find(s => s.slug === sceneSlugParam)?.id || "") : "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaSlugParam, catSlugParam, sceneSlugParam, masterLoaded]);

  // ── URL更新ヘルパー ─────────────────────────────────────────────────
  const updateUrl = useCallback((
    ids: { areaId: string; categoryId: string; sceneId: string; q: string; sortBy: string; page: string },
    currentAreas: Area[], currentCategories: Category[], currentScenes: any[]
  ) => {
    const qs = new URLSearchParams();
    if (ids.areaId)      { const s = currentAreas.find(a => a.id === ids.areaId)?.slug;       if (s) qs.set("area",     s); }
    if (ids.categoryId)  { const s = currentCategories.find(c => c.id === ids.categoryId)?.slug; if (s) qs.set("category", s); }
    if (ids.sceneId)     { const s = (currentScenes as any[]).find(sc => sc.id === ids.sceneId)?.slug; if (s) qs.set("scene", s); }
    if (ids.q)           qs.set("q",      ids.q);
    if (ids.sortBy && ids.sortBy !== "displayPriority") qs.set("sortBy", ids.sortBy);
    if (ids.page && ids.page !== "1")                   qs.set("page",   ids.page);
    const str = qs.toString();
    router.replace(`${pathname}${str ? `?${str}` : ""}`, { scroll: false });
  }, [router, pathname]);

  // ── 店舗取得 ────────────────────────────────────────────────────────
  const fetchPlaces = useCallback(async () => {
    if (!masterLoaded) return; // マスターデータ未ロード時はスキップ
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pageParam), limit: "12" };
      if (resolvedAreaId)     params.areaId     = resolvedAreaId;
      if (resolvedCategoryId) params.categoryId = resolvedCategoryId;
      if (resolvedSceneId)    params.sceneId    = resolvedSceneId;
      if (searchQueryParam)   params.q          = searchQueryParam;
      if (sortByParam === "newest")  { params.sortBy = "createdAt";      params.sortOrder = "desc"; }
      else if (sortByParam === "popular") { params.sortBy = "viewCount"; params.sortOrder = "desc"; }
      else                             { params.sortBy = "displayPriority"; params.sortOrder = "desc"; }
      const data = await getPlaces(params);
      setPlaces(data.items);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [masterLoaded, pageParam, resolvedAreaId, resolvedCategoryId, resolvedSceneId, searchQueryParam, sortByParam]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // ── フィルター操作 ──────────────────────────────────────────────────
  // 状態は持たず、直接URLを更新する。次のレンダーで searchParams から読み直す。
  const handleFilterChange = (field: string, value: string) => {
    const next = {
      areaId:     field === "areaId"     ? value : resolvedAreaId,
      categoryId: field === "categoryId" ? value : resolvedCategoryId,
      sceneId:    field === "sceneId"    ? value : resolvedSceneId,
      q:          field === "q"          ? value : searchQueryParam,
      sortBy:     field === "sortBy"     ? value : sortByParam,
      page:       "1", // フィルター変更時は1ページ目へ
    };
    updateUrl(next, areas, categories, scenes);
  };

  const handlePageChange = (p: number) => {
    updateUrl({ areaId: resolvedAreaId, categoryId: resolvedCategoryId, sceneId: resolvedSceneId, q: searchQueryParam, sortBy: sortByParam, page: String(p) }, areas, categories, scenes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getName = (translations: { name: string }[]) => translations[0]?.name || "";

  return (
    <div className="w-full bg-[#f8f9fa]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pb-20">
        <h1 className="text-center text-[28px] font-bold text-[#333] md:text-[32px] mb-2">
          店舗一覧
        </h1>
        <p className="text-center text-[13px] text-[#666] md:text-[14px] mb-6">
          日本人向けに厳選した店舗を中心に掲載しています。
        </p>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 md:p-8 mb-8 shadow-sm border border-[#f0f0f0]">
          {/* Search */}
          <div className="mb-6">
            <h3 className="text-[13px] font-bold text-[#333] mb-3">検索</h3>
            <input
              type="text"
              value={searchQueryParam}
              onChange={(e) => handleFilterChange("q", e.target.value)}
              placeholder="店舗名・キーワードで検索..."
              className="w-full rounded-lg border border-[#d0d0d0] px-4 py-2.5 text-[13px] focus:border-[#004098] focus:outline-none"
            />
          </div>

          {/* Areas */}
          <div className="mb-6">
            <h3 className="text-[13px] font-bold text-[#333] mb-3">エリア</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange("areaId", "")}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  !resolvedAreaId
                    ? "bg-[#004098] text-white border border-[#004098]"
                    : "bg-white text-[#333] border border-[#d0d0d0] hover:border-[#004098]"
                }`}
              >
                すべて
              </button>
              {areas.map(a => (
                <button
                  key={a.id}
                  onClick={() => handleFilterChange("areaId", a.id)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    resolvedAreaId === a.id
                      ? "bg-[#004098] text-white border border-[#004098]"
                      : "bg-white text-[#333] border border-[#d0d0d0] hover:border-[#004098]"
                  }`}
                >
                  {getName(a.translations)}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-[13px] font-bold text-[#333] mb-3">カテゴリ</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange("categoryId", "")}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  !resolvedCategoryId
                    ? "bg-[#004098] text-white border border-[#004098]"
                    : "bg-white text-[#333] border border-[#d0d0d0] hover:border-[#004098]"
                }`}
              >
                すべて
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleFilterChange("categoryId", c.id)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    resolvedCategoryId === c.id
                      ? "bg-[#004098] text-white border border-[#004098]"
                      : "bg-white text-[#333] border border-[#d0d0d0] hover:border-[#004098]"
                  }`}
                >
                  {getName(c.translations)}
                </button>
              ))}
            </div>
          </div>

          {/* Scenes */}
          <div>
            <h3 className="text-[13px] font-bold text-[#333] mb-3">シーン</h3>
            <div className="flex flex-wrap gap-2">
              {scenes.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleFilterChange("sceneId", resolvedSceneId === s.id ? "" : s.id)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    resolvedSceneId === s.id
                      ? "bg-[#004098] text-white border border-[#004098]"
                      : "bg-white text-[#333] border border-[#d0d0d0] hover:border-[#004098]"
                  }`}
                >
                  {getName(s.translations)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count + sort */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-[#666]">{total}件の店舗が見つかりました</p>
          <div className="flex gap-2">
            {[
              { value: "displayPriority", label: "おすすめ順" },
              { value: "newest", label: "新着順" },
              { value: "popular", label: "人気順" },
            ].map(opt => (
              <button key={opt.value} onClick={() => handleFilterChange("sortBy", opt.value)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  sortByParam === opt.value ? "bg-[#004098] text-white" : "bg-white text-[#333] border border-[#d0d0d0] hover:border-[#004098]"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-[#f0f0f0] animate-pulse">
                <div className="w-full h-48 md:h-56 bg-gray-200" />
                <div className="p-4 md:p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[16px] text-[#999]">該当する店舗が見つかりませんでした</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {places.map(place => {
              const t = place.translations[0];
              const areaName = place.area?.translations[0]?.name || "";
              const categoryName = place.categories[0]?.category.translations[0]?.name || "";
              const imageUrl = place.images[0]?.url || "/img/temp_3.jpg";

              return (
                <Link key={place.slug} href={`/shops/${place.slug}`} className="group block">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-[#f0f0f0] hover:shadow-lg transition-shadow">
                    <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-200">
                      <Image
                        src={imageUrl}
                        alt={t?.name || place.slug}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 md:p-5">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="text-[15px] md:text-[16px] font-bold text-[#333]">
                          {t?.name || place.slug}
                        </h3>
                        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#666] whitespace-nowrap">
                          <span className="text-[#999]">{place.viewCount} views</span>
                        </div>
                      </div>
                      <p className="text-[11px] md:text-[12px] text-[#999] mb-3">
                        {areaName}{areaName && categoryName ? " · " : ""}{categoryName}
                      </p>
                      {t?.description && (
                        <p className="text-[12px] md:text-[13px] text-[#666] line-clamp-3 mb-3 leading-relaxed">
                          {t.description.replace(/<[^>]+>/g, "")}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {place.tags.map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="px-2.5 py-1 bg-[#f0f4f8] text-[#666] text-[10px] md:text-[11px] rounded border border-[#e0e8f0]"
                          >
                            {tag.translations[0]?.name || tag.slug}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12 md:mt-16">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 md:w-11 md:h-11 rounded-full font-bold text-[15px] md:text-[16px] transition-all ${
                  pageParam === p
                    ? "bg-[#004098] text-white"
                    : "bg-white text-[#333] border border-[#d0d0d0] hover:border-[#004098]"
                }`}
              >
                {p}
              </button>
            ))}
            {pageParam < totalPages && (
              <button
                onClick={() => handlePageChange(pageParam + 1)}
                className="ml-2 text-[15px] md:text-[18px] font-bold text-[#114f9d] hover:text-[#004098] transition-colors"
              >
                次へ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
