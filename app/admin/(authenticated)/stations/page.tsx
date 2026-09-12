"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const LINES = ["BTS", "MRT", "ARL", "BRT", "その他"]

type Station = { id: string; name: string; line: string | null; displayOrder: number }

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Station | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", line: "BTS", displayOrder: 0 })

  const fetch_ = async () => {
    try {
      const res = await fetch("/api/v1/admin/stations")
      const json = await res.json()
      if (json.success) setStations(json.data)
    } catch { toast.error("取得に失敗しました") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch_() }, [])

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error("駅名は必須です"); return }
    try {
      const res = await fetch("/api/v1/admin/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) { toast.success("追加しました"); setAddOpen(false); setForm({ name: "", line: "BTS", displayOrder: 0 }); fetch_() }
      else toast.error(json.error || "追加に失敗しました")
    } catch { toast.error("追加に失敗しました") }
  }

  const handleEdit = async () => {
    if (!editTarget) return
    try {
      const res = await fetch(`/api/v1/admin/stations?id=${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTarget.name, line: editTarget.line, displayOrder: editTarget.displayOrder }),
      })
      const json = await res.json()
      if (json.success) { toast.success("更新しました"); setEditTarget(null); fetch_() }
      else toast.error(json.error || "更新に失敗しました")
    } catch { toast.error("更新に失敗しました") }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/v1/admin/stations?id=${deleteId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) { toast.success("削除しました"); fetch_() }
      else toast.error(json.error || "削除に失敗しました")
    } catch { toast.error("削除に失敗しました") }
    finally { setDeleteId(null) }
  }

  // Group by line
  const grouped = LINES.reduce((acc, line) => {
    acc[line] = stations.filter(s => (s.line || "その他") === line)
    return acc
  }, {} as Record<string, Station[]>)

  if (loading) return <div className="py-20 text-center text-muted-foreground">読み込み中...</div>

  return (
    <div>
      <PageHeader title="駅設定" description="最寄り駅の一覧を管理します。店舗登録時のプルダウンに反映されます。">
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />駅を追加
        </Button>
      </PageHeader>

      <div className="mt-6 space-y-6">
        {LINES.map(line => grouped[line]?.length > 0 && (
          <Card key={line}>
            <CardHeader>
              <CardTitle className="text-base">{line}線</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>駅名</TableHead>
                    <TableHead>路線</TableHead>
                    <TableHead>表示順</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grouped[line].map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.line || "—"}</TableCell>
                      <TableCell>{s.displayOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditTarget(s)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(s.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
        {stations.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            駅が登録されていません。「駅を追加」から登録してください。
          </div>
        )}
      </div>

      {/* Add modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>駅を追加</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>駅名 *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="例: BTSアソーク駅" />
            </div>
            <div className="space-y-2">
              <Label>路線</Label>
              <Select value={form.line} onValueChange={v => setForm({ ...form, line: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LINES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>表示順</Label>
              <Input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>キャンセル</Button>
            <Button onClick={handleAdd}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>駅を編集</DialogTitle></DialogHeader>
          {editTarget && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>駅名 *</Label>
                <Input value={editTarget.name} onChange={e => setEditTarget({ ...editTarget, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>路線</Label>
                <Select value={editTarget.line || "その他"} onValueChange={v => setEditTarget({ ...editTarget, line: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LINES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>表示順</Label>
                <Input type="number" value={editTarget.displayOrder} onChange={e => setEditTarget({ ...editTarget, displayOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>キャンセル</Button>
            <Button onClick={handleEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>駅を削除</AlertDialogTitle>
            <AlertDialogDescription>この駅を削除しますか？この操作は取り消せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
