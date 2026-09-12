"use client"

import { useEffect, useState, useCallback } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Trash2, Check, X, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

type UsageType =
  | "place"
  | "area"
  | "category"
  | "article"
  | "job"
  | "curated-list"
  | "today-event"

type Usage = {
  type: UsageType
  name: string
  detail?: string
}

const USAGE_LABELS: Record<UsageType, string> = {
  place: "店舗",
  area: "エリア",
  category: "カテゴリ",
  article: "記事",
  job: "求人",
  "curated-list": "特集",
  "today-event": "イベント",
}

const USAGE_COLORS: Record<UsageType, string> = {
  place: "bg-blue-100 text-blue-700",
  area: "bg-emerald-100 text-emerald-700",
  category: "bg-purple-100 text-purple-700",
  article: "bg-amber-100 text-amber-700",
  job: "bg-rose-100 text-rose-700",
  "curated-list": "bg-cyan-100 text-cyan-700",
  "today-event": "bg-pink-100 text-pink-700",
}

type MediaItem = {
  id: string
  url: string
  filename: string
  size: number
  createdAt: string
  publicId: string | null
  usages: Usage[]
  storeName: string | null
  areaName: string | null
}

function formatSize(bytes: number) {
  if (!bytes || bytes === 0) return "不明"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [storeFilter, setStoreFilter] = useState("")
  const [areaFilter, setAreaFilter] = useState("")
  const [usageFilter, setUsageFilter] = useState<"all" | "used" | "unused">("all")
  const [contentTypeFilter, setContentTypeFilter] = useState<UsageType | "">("")
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<MediaItem | null>(null)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(
    async (p = 1) => {
      setLoading(true)
      const params = new URLSearchParams({ page: String(p) })
      if (search) params.set("search", search)
      if (storeFilter) params.set("store", storeFilter)
      if (areaFilter) params.set("area", areaFilter)
      if (usageFilter !== "all") params.set("usage", usageFilter)
      if (contentTypeFilter) params.set("contentType", contentTypeFilter)

      const res = await fetch(`/api/v1/admin/media?${params}`)
      const json = await res.json()
      setItems(json.data?.items || [])
      setTotal(json.data?.total || 0)
      setTotalPages(json.data?.totalPages || 1)
      setPage(json.data?.page || p)
      setLoading(false)
    },
    [search, storeFilter, areaFilter, usageFilter, contentTypeFilter]
  )

  useEffect(() => {
    load(1)
    // Auto-backfill sizes in background, then reload to show updated sizes
    fetch("/api/v1/admin/media/sync", { method: "POST" })
      .then(() => load(1))
      .catch(() => {})
  }, [])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch("/api/v1/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected] }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(`${json.data.deleted}件削除しました`)
      setSelected(new Set())
      setDeleteConfirm(false)
      load(1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "削除に失敗しました")
    } finally {
      setDeleting(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load(1)
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/v1/admin/media/sync", { method: "POST" })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(`${json.data.created}件の画像を同期しました`)
      load(1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "同期に失敗しました")
    } finally {
      setSyncing(false)
    }
  }

  const clearFilters = () => {
    setSearch("")
    setStoreFilter("")
    setAreaFilter("")
    setUsageFilter("all")
    setContentTypeFilter("")
  }

  const hasActiveFilters =
    search || storeFilter || areaFilter || usageFilter !== "all" || contentTypeFilter

  return (
    <div className="space-y-4">
      <PageHeader title="画像管理">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{total}件</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            title="データベース内の画像をMediaテーブルと同期"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "同期中..." : "画像を同期"}
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <form onSubmit={handleSearch} className="space-y-2">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="ファイル名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Input
            className="max-w-36"
            placeholder="店舗名"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          />
          <Input
            className="max-w-36"
            placeholder="エリア名"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          />
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value as "all" | "used" | "unused")}
          >
            <option value="all">すべて</option>
            <option value="used">使用中</option>
            <option value="unused">未使用</option>
          </select>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value as UsageType | "")}
          >
            <option value="">すべてのコンテンツ</option>
            <option value="place">店舗</option>
            <option value="area">エリア</option>
            <option value="category">カテゴリ</option>
            <option value="article">記事</option>
            <option value="job">求人</option>
            <option value="curated-list">特集</option>
            <option value="today-event">イベント</option>
          </select>
          <Button type="submit" variant="outline">
            検索
          </Button>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5 mr-1" />
              クリア
            </Button>
          )}
        </div>
      </form>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-2">
          <span className="text-sm font-medium">{selected.size}件選択中</span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            選択解除
          </button>
          <div className="ml-auto">
            <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="mr-1 h-4 w-4" />
              一括削除
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <p className="py-12 text-center text-muted-foreground">読み込み中...</p>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {hasActiveFilters ? "条件に一致する画像がありません" : "画像がありません"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => {
            const isSelected = selected.has(item.id)
            const isUnused = item.usages.length === 0
            return (
              <div
                key={item.id}
                className={`group relative cursor-pointer rounded-xl border-2 overflow-hidden transition ${
                  isSelected
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
                onClick={() => toggleSelect(item.id)}
              >
                <div className="relative aspect-square bg-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                {/* Unused badge */}
                {isUnused && (
                  <div className="absolute top-1.5 left-1.5 flex h-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                    未使用
                  </div>
                )}
                {/* Preview button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreview(item)
                  }}
                  className="absolute top-1.5 right-1.5 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow text-[10px] font-bold text-gray-700"
                >
                  ↗
                </button>
                <div className="p-2">
                  <p className="truncate text-[11px] font-medium text-foreground">
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(item.size)}</p>
                  {/* Usage badges */}
                  {item.usages.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.usages.map((usage, idx) => (
                        <span
                          key={idx}
                          className={`inline-block rounded px-1 py-0.5 text-[9px] font-medium ${USAGE_COLORS[usage.type]}`}
                          title={usage.detail ? `${usage.name} — ${usage.detail}` : usage.name}
                        >
                          {USAGE_LABELS[usage.type]}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Store/area info */}
                  {item.storeName && (
                    <p className="truncate text-[10px] text-primary font-medium mt-0.5">
                      🏪 {item.storeName}
                    </p>
                  )}
                  {item.areaName && (
                    <p className="truncate text-[10px] text-muted-foreground">
                      📍 {item.areaName}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
          >
            次へ
          </Button>
        </div>
      )}

      {/* Delete confirm */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>画像削除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {selected.size}件の画像を削除しますか？
            <br />
            <span className="text-destructive font-medium">
              Cloudinaryからも完全に削除されます。この操作は元に戻せません。
            </span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span className="truncate">{preview?.filename}</span>
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={preview.filename}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{formatSize(preview.size)}</span>
                <span>{new Date(preview.createdAt).toLocaleDateString("ja-JP")}</span>
              </div>
              {/* Usage info in preview */}
              {preview.usages.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">使用箇所</p>
                  {preview.usages.map((usage, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${USAGE_COLORS[usage.type]}`}
                      >
                        {USAGE_LABELS[usage.type]}
                      </span>
                      <span className="font-medium">{usage.name}</span>
                      {usage.detail && (
                        <span className="text-muted-foreground text-xs">({usage.detail})</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-orange-500 font-medium">未使用の画像</p>
              )}
              <div className="flex gap-2">
                <Input value={preview.url} readOnly className="text-xs" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(preview.url)
                    toast.success("URLをコピーしました")
                  }}
                >
                  コピー
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
