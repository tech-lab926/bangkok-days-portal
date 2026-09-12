"use client"

import { useEffect, useState } from "react"
import { scenesApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { FixedSaveButton } from "@/components/admin/fixed-save-button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowUp, ArrowDown, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface SceneItem {
  id: string
  displayOrder: number
  enabled: boolean
  name: string
  slug: string
  icon: string
  _count?: { places: number }
}

const EMPTY = { name: "", slug: "", icon: "" }

export default function ScenesPage() {
  const [scenes, setScenes] = useState<SceneItem[]>([])
  const [original, setOriginal] = useState<SceneItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<SceneItem | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [addLoading, setAddLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SceneItem | null>(null)

  const fetchScenes = async () => {
    try {
      setLoading(true)
      const data = await scenesApi.list()
      const mapped = data.map((s: any) => ({
        id: s.id,
        displayOrder: s.displayOrder,
        enabled: s.enabled,
        name: s.translations?.[0]?.name || "",
        slug: s.slug || "",
        icon: s.icon || "",
        _count: s._count,
      }))
      setScenes(mapped)
      setOriginal(JSON.parse(JSON.stringify(mapped)))
    } catch { toast.error("シーンの取得に失敗しました") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchScenes() }, [])

  const hasChanges = JSON.stringify(scenes) !== JSON.stringify(original)

  const moveUp = (i: number) => {
    if (i === 0) return
    const s = [...scenes]
    ;[s[i - 1], s[i]] = [s[i], s[i - 1]]
    s.forEach((x, idx) => (x.displayOrder = idx))
    setScenes(s)
  }

  const moveDown = (i: number) => {
    if (i === scenes.length - 1) return
    const s = [...scenes]
    ;[s[i], s[i + 1]] = [s[i + 1], s[i]]
    s.forEach((x, idx) => (x.displayOrder = idx))
    setScenes(s)
  }

  const updateScene = (i: number, field: string, value: any) =>
    setScenes(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const handleSave = async () => {
    setSaving(true)
    try {
      await scenesApi.bulkUpdate(scenes.map(s => ({
        id: s.id, name: s.name, slug: s.slug, icon: s.icon,
        displayOrder: s.displayOrder, enabled: s.enabled,
      })))
      setOriginal(JSON.parse(JSON.stringify(scenes)))
      toast.success("シーン設定を保存しました")
    } catch (err: any) { toast.error(err.message || "保存に失敗しました") }
    finally { setSaving(false) }
  }

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setModal(true) }
  const openEdit = (s: SceneItem) => { setEditing(s); setForm({ name: s.name, slug: s.slug, icon: s.icon }); setModal(true) }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/v1/admin/scenes?id=${deleteTarget.id}`, { method: "DELETE" })
      toast.success("削除しました")
      setDeleteTarget(null)
      fetchScenes()
    } catch { toast.error("削除に失敗しました") }
  }

  const handleModalSave = async () => {
    if (!form.name) { toast.error("シーン名は必須です"); return }
    setAddLoading(true)
    try {
      if (editing) {
        await scenesApi.bulkUpdate([{ id: editing.id, name: form.name, slug: form.slug, icon: form.icon }])
        toast.success("更新しました")
      } else {
        const res = await fetch("/api/v1/admin/scenes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, displayOrder: scenes.length }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        toast.success("追加しました")
      }
      setModal(false)
      fetchScenes()
    } catch (err: any) { toast.error(err.message || "保存に失敗しました") }
    finally { setAddLoading(false) }
  }

  return (
    <div>
      <PageHeader title="シーン設定">
        <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />追加</Button>
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>アイコン</TableHead>
              <TableHead>シーン名</TableHead>
              <TableHead>スラッグ</TableHead>
              <TableHead className="w-24">表示順</TableHead>
              <TableHead className="w-24">有効/無効</TableHead>
              <TableHead className="w-20">使用数</TableHead>
              <TableHead className="w-16">編集</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">読み込み中...</TableCell></TableRow>
            ) : scenes.map((scene, i) => (
              <TableRow key={scene.id}>
                <TableCell className="text-2xl">{scene.icon || "—"}</TableCell>
                <TableCell>
                  <Input value={scene.name} onChange={e => updateScene(i, "name", e.target.value)} className="max-w-48" />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{scene.slug || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => moveUp(i)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => moveDown(i)} disabled={i === scenes.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Switch checked={scene.enabled} onCheckedChange={v => updateScene(i, "enabled", v)} />
                </TableCell>
                <TableCell><Badge variant="outline">{scene._count?.places ?? 0}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(scene)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(scene)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FixedSaveButton onClick={handleSave} disabled={!hasChanges} loading={saving} />

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "シーン編集" : "シーン追加"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>シーン名 *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例: デート" />
            </div>
            <div className="space-y-1">
              <Label>スラッグ（未入力時は自動生成）</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="例: date" />
            </div>
            <div className="space-y-1">
              <Label>アイコン（絵文字）</Label>
              <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="例: 💑" />
              <p className="text-xs text-muted-foreground">絵文字を1文字入力してください</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>キャンセル</Button>
            <Button onClick={handleModalSave} disabled={addLoading}>{addLoading ? "保存中..." : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>シーン削除</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">「{deleteTarget?.name}」を削除しますか？{(deleteTarget?._count?.places ?? 0) > 0 && <span className="block mt-1 text-destructive">このシーンは{deleteTarget?._count?.places}件の店舗に使用されています。</span>}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleDelete}>削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
