"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { storesApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Pencil, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

export default function NightStoreListPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("updatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {
        type: "NIGHT",
        sortBy,
        sortOrder,
      }
      if (search) params.search = search
      const data = await storesApi.list(params)
      setStores(data.items)
    } catch {
      toast.error("ナイト店舗一覧の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }, [search, sortBy, sortOrder])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      await storesApi.toggleVisibility(id, !current)
      setStores((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isVisible: !current } : s))
      )
    } catch {
      toast.error("表示状態の更新に失敗しました")
    }
  }

  const getName = (store: any) =>
    store.translations?.[0]?.name || "（名称未設定）"
  const getAreaName = (store: any) =>
    store.area?.translations?.[0]?.name || "—"

  const SortButton = ({ column, label }: { column: string; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <div>
      <PageHeader title="ナイト店舗" />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="店舗名で検索（部分一致）"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
              <TableHead>カテゴリ</TableHead>
              <TableHead>シーン</TableHead>
              <TableHead>
                <SortButton column="isVisible" label="表示状態" />
              </TableHead>
              <TableHead>
                <SortButton column="updatedAt" label="最終更新日" />
              </TableHead>
              <TableHead className="w-16">編集</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  ナイト店舗がありません
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{getName(store)}</TableCell>
                  <TableCell>{getAreaName(store)}</TableCell>
                  <TableCell className="max-w-40 truncate">
                    {store.categories
                      ?.map((c: any) => c.category?.translations?.[0]?.name)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell className="max-w-40 truncate">
                    {store.scenes
                      ?.map((s: any) => s.scene?.translations?.[0]?.name)
                      .filter(Boolean)
                      .join(", ") || "—"}
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
                    <Link href={`/admin/stores/${store.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
