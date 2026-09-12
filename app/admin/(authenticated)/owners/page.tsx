"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ownersApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Pencil, Plus, Trash2 } from "lucide-react"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import { toast } from "sonner"

export default function OwnersPage() {
  const [owners, setOwners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (search) params.search = search
      const data = await ownersApi.list(params)
      setOwners(data.items || [])
    } catch {
      toast.error("オーナーの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchOwners()
  }, [fetchOwners])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await ownersApi.delete(deleteTarget.id)
      toast.success("オーナーを削除しました")
      setDeleteTarget(null)
      await fetchOwners()
    } catch (err: any) {
      toast.error(err.message || "削除に失敗しました")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="オーナー管理（会社）">
        <Link href="/admin/owners/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            新規登録
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="会社名・担当者名で検索"
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
              <TableHead>会社名</TableHead>
              <TableHead>担当者名</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead>メール</TableHead>
              <TableHead>契約プラン</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>店舗数</TableHead>
              <TableHead className="w-16">編集</TableHead>
              <TableHead className="w-16">削除</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : owners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  オーナーがいません
                </TableCell>
              </TableRow>
            ) : (
              owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.companyName}</TableCell>
                  <TableCell>{owner.contactName}</TableCell>
                  <TableCell>{owner.phone}</TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>{owner.plan?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={owner.active ? "default" : "secondary"}>
                      {owner.active ? "有効" : "無効"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{owner._count?.places ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/owners/${owner.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(owner)}
                      disabled={(owner._count?.places ?? 0) > 0}
                      title={(owner._count?.places ?? 0) > 0 ? "店舗が紐付いているため削除不可" : "削除"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="オーナー削除"
        description={`「${deleteTarget?.companyName}」を削除します。この操作は元に戻せません。`}
        confirmLabel="削除"
        destructive
        loading={deleteLoading}
      />
    </div>
  )
}
