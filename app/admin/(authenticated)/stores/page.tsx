"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { storesApi } from "@/lib/admin-api";
import { PageHeader } from "@/components/admin/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/admin/confirm-modal";

const PAGE_SIZE = 30;

export default function StoreListPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [areaId, setAreaId] = useState("");
  const [stationName, setStationName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [areas, setAreas] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/areas").then(r => r.json()),
      fetch("/api/v1/admin/stations").then(r => r.json()),
      fetch("/api/v1/categories").then(r => r.json()),
    ]).then(([a, s, c]) => {
      setAreas(a.data || []);
      setStations(s.data || []);
      setCategories(c.data || []);
    });
  }, []);

  const fetchStores = useCallback(async (p = page) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        sortBy, sortOrder,
        page: String(p),
        limit: String(PAGE_SIZE),
      };
      if (search) params.search = search;
      if (areaId) params.areaId = areaId;
      if (stationName) params.stationId = stationName;
      if (categoryId) params.categoryId = categoryId;
      const data = await storesApi.list(params);
      setStores(data.items ?? data);
      setTotal(data.pagination?.total ?? data.total ?? 0);
    } catch {
      toast.error("店舗一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, areaId, stationName, categoryId, page]);

  useEffect(() => {
    fetchStores(page);
  }, [fetchStores]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // Reset to page 1 when filters change
  const applySearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleSort = (column: string) => {
    setPage(1);
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      await storesApi.toggleVisibility(id, !current);
      setStores((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isVisible: !current } : s)),
      );
    } catch {
      toast.error("表示状態の更新に失敗しました");
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await storesApi.delete(id);
      setStores((prev) => prev.filter((s) => s.id !== id));
      setTotal(t => t - 1);
      toast.success("店舗を削除しました");
    } catch (err: any) {
      toast.error(err?.message || "削除に失敗しました");
    }
  };

  const getName = (store: any) =>
    store.translations?.[0]?.name || "（名称未設定）";
  const getAreaName = (store: any) =>
    store.area?.translations?.[0]?.name || "—";
  const getCategories = (store: any) =>
    store.categories
      ?.map((c: any) => c.category?.translations?.[0]?.name)
      .filter(Boolean)
      .join(", ") || "—";
  const getScenes = (store: any) =>
    store.scenes
      ?.map((s: any) => s.scene?.translations?.[0]?.name)
      .filter(Boolean)
      .join(", ") || "—";
  const getTags = (store: any) =>
    store.tags
      ?.map((t: any) => t.tag?.translations?.[0]?.name)
      .filter(Boolean)
      .join(", ") || "—";

  const SortButton = ({ column, label }: { column: string; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div>
      <PageHeader title="店舗一覧">
        <Link href="/admin/stores/new">
          <Button>新規登録</Button>
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="店舗名で検索（Enterで検索）"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={applySearch}>
          <Search className="h-4 w-4 mr-1" />検索
        </Button>
        <select className="h-9 rounded-md border px-3 text-sm" value={areaId} onChange={e => { setAreaId(e.target.value); setPage(1); }}>
          <option value="">エリア</option>
          {areas.map((a: any) => <option key={a.id} value={a.id}>{a.translations?.[0]?.name}</option>)}
        </select>
        <select className="h-9 rounded-md border px-3 text-sm" value={stationName} onChange={e => { setStationName(e.target.value); setPage(1); }}>
          <option value="">駅名</option>
          {stations.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <select className="h-9 rounded-md border px-3 text-sm" value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }}>
          <option value="">メインカテゴリ</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.translations?.[0]?.name}</option>)}
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton column="name" label="店舗名" />
              </TableHead>
              <TableHead>
                <SortButton column="area" label="エリア" />
              </TableHead>
              <TableHead>
                <SortButton column="category" label="カテゴリ" />
              </TableHead>
              <TableHead>種別</TableHead>
              <TableHead>オーナー</TableHead>
              <TableHead>
                <SortButton column="displayPriority" label="優先度" />
              </TableHead>
              <TableHead>
                <SortButton column="isVisible" label="表示状態" />
              </TableHead>
              <TableHead>
                <SortButton column="updatedAt" label="最終更新日" />
              </TableHead>
              <TableHead className="w-24">編集</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  店舗がありません
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    {getName(store)}
                  </TableCell>
                  <TableCell>{getAreaName(store)}</TableCell>
                  <TableCell className="max-w-40 truncate">
                    {getCategories(store)}
                  </TableCell>
                  <TableCell className="max-w-40 truncate">
                    {getScenes(store)}
                  </TableCell>
                  <TableCell className="max-w-40 truncate">
                    {getTags(store)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={store.type === "NIGHT" ? "secondary" : "outline"}>
                      {store.type === "NIGHT" ? "ナイト" : "通常"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {store.owner?.companyName || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={store.displayPriority > 0 ? "default" : "outline"}>
                      {store.displayPriority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={store.isVisible}
                      onCheckedChange={() =>
                        handleToggleVisibility(store.id, store.isVisible)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(store.updatedAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/stores/${store.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(store.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            全 {total} 件中 {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, total)} 件表示
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="icon"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => goToPage(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="outline" size="icon"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) handleDelete(deletingId);
          setDeletingId(null);
        }}
        title="店舗を削除しますか？"
        description="この操作は取り消せません。店舗に関連するすべてのデータが削除されます。"
        confirmLabel="削除"
        destructive
      />
    </div>
  );
}
