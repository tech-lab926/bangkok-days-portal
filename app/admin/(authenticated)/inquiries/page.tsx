"use client"

import { useEffect, useState, useCallback } from "react"
import { inquiriesApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "未対応",
  IN_PROGRESS: "対応中",
  COMPLETED: "対応完了",
}

const TYPE_LABELS: Record<string, string> = {
  STORE_LISTING: "掲載依頼",
  GENERAL: "一般問い合わせ",
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hideCompleted, setHideCompleted] = useState(true)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<any | null>(null)

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = { limit: "100" }
      if (hideCompleted) params.status = "PENDING"
      const data = await inquiriesApi.list(params)
      setInquiries(data.items || [])
    } catch {
      toast.error("掲載依頼の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }, [hideCompleted])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await inquiriesApi.updateStatus(id, newStatus)
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      )
      if (selected?.id === id) setSelected((prev: any) => ({ ...prev, status: newStatus }))
      toast.success("ステータスを更新しました")
    } catch {
      toast.error("ステータスの更新に失敗しました")
    }
  }

  const sortedInquiries = [...inquiries].sort((a, b) => {
    const aVal = a[sortBy] || ""
    const bVal = b[sortBy] || ""
    const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    return sortOrder === "asc" ? cmp : -cmp
  })

  const displayed = hideCompleted
    ? sortedInquiries.filter((i) => i.status !== "COMPLETED")
    : sortedInquiries

  const SortButton = ({ column, label }: { column: string; label: string }) => (
    <button onClick={() => handleSort(column)} className="flex items-center gap-1 hover:text-foreground">
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <div>
      <PageHeader title="掲載依頼" />

      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-2">
          <Checkbox checked={hideCompleted} onCheckedChange={(v) => setHideCompleted(!!v)} />
          <span className="text-sm">対応完了済みを非表示にする</span>
        </label>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortButton column="createdAt" label="日付" /></TableHead>
              <TableHead><SortButton column="type" label="種別" /></TableHead>
              <TableHead><SortButton column="storeName" label="店舗名" /></TableHead>
              <TableHead><SortButton column="name" label="担当者名" /></TableHead>
              <TableHead><SortButton column="email" label="メール" /></TableHead>
              <TableHead>件名・内容</TableHead>
              <TableHead><SortButton column="status" label="対応状況" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">読み込み中...</TableCell>
              </TableRow>
            ) : displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">掲載依頼がありません</TableCell>
              </TableRow>
            ) : (
              displayed.map((inq) => (
                <TableRow key={inq.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(inq)}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(inq.createdAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{TYPE_LABELS[inq.type] || inq.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{inq.storeName || "—"}</TableCell>
                  <TableCell>{inq.name}</TableCell>
                  <TableCell className="text-sm">{inq.email}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs font-medium">{inq.subject}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{inq.message}</p>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select value={inq.status} onValueChange={(v) => handleStatusChange(inq.id, v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">未対応</SelectItem>
                        <SelectItem value="IN_PROGRESS">対応中</SelectItem>
                        <SelectItem value="COMPLETED">対応完了</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>問い合わせ詳細</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto pr-1">
              <Row label="種別" value={TYPE_LABELS[selected.type] || selected.type} />
              <Row label="日付" value={new Date(selected.createdAt).toLocaleString("ja-JP")} />
              <Row label="店舗名" value={selected.storeName || "—"} />
              <Row label="担当者名" value={selected.name} />
              <Row label="電話番号" value={selected.phone || "—"} />
              <Row label="メール" value={selected.email} />
              <Row label="件名" value={selected.subject} />
              <div>
                <p className="font-medium text-muted-foreground mb-1">内容</p>
                <p className="whitespace-pre-wrap break-all rounded-md bg-muted p-3">{selected.message}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className="font-medium text-muted-foreground">対応状況</span>
                <Select value={selected.status} onValueChange={(v) => handleStatusChange(selected.id, v)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">未対応</SelectItem>
                    <SelectItem value="IN_PROGRESS">対応中</SelectItem>
                    <SelectItem value="COMPLETED">対応完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="break-all text-sm">{value}</span>
    </div>
  )
}
