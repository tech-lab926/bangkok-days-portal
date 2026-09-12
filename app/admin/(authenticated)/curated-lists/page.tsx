"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function CuratedListsPage() {
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch("/api/v1/admin/curated-lists")
    const json = await res.json()
    setLists(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    await fetch(`/api/v1/admin/curated-lists/${deleteTarget.id}`, { method: "DELETE" })
    toast.success("削除しました")
    setDeleteTarget(null)
    load()
  }

  return (
    <div>
      <PageHeader title="特集・キュレーション">
        <Link href="/admin/curated-lists/new">
          <Button><Plus className="mr-1 h-4 w-4" />新規作成</Button>
        </Link>
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>スラッグ</TableHead>
              <TableHead>店舗数</TableHead>
              <TableHead>公開</TableHead>
              <TableHead className="w-28">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">読み込み中...</TableCell></TableRow>
            ) : lists.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">特集がありません</TableCell></TableRow>
            ) : lists.map((list) => (
              <TableRow key={list.id}>
                <TableCell className="font-medium">{list.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{list.slug}</TableCell>
                <TableCell><Badge variant="outline">{list.places?.length || 0}件</Badge></TableCell>
                <TableCell>
                  <Badge variant={list.published ? "default" : "secondary"}>{list.published ? "公開中" : "下書き"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/admin/curated-lists/${list.id}/edit`}>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                    <a href={`/featured/${list.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(list)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>特集削除</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">「{deleteTarget?.title}」を削除しますか？</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleDelete}>削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
