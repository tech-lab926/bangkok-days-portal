"use client"

import { useEffect, useState } from "react"
import { jobsApi, areasApi, categoriesApi, storesApi } from "@/lib/admin-api"
import { ImageUploader } from "@/components/admin/image-uploader"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

const EMPTY = { company: "", title: "", category: "", location: "", description: "", placeId: "", imageUrl: "" }

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const loadAll = async () => {
    try {
      setLoading(true)
      const [j, a, c, s] = await Promise.all([
        jobsApi.list(),
        areasApi.list(),
        categoriesApi.list(),
        storesApi.list({ limit: "200" }),
      ])
      setJobs(j)
      setAreas(a)
      setCategories(c)
      setStores(s.items || [])
    } catch { toast.error("取得に失敗しました") }
    finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  const openAdd = () => { setSelected(null); setForm(EMPTY); setModal(true) }
  const openEdit = (job: any) => {
    setSelected(job)
    setForm({ company: job.company, title: job.title, category: job.category, location: job.location, description: job.description || "", placeId: job.placeId || "", imageUrl: job.imageUrl || "" })
    setModal(true)
  }

  const f = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    if (!form.company || !form.title) { toast.error("会社名と求人タイトルは必須です"); return }
    setSaving(true)
    try {
      const payload = { ...form, placeId: form.placeId || null }
      if (selected) { await jobsApi.update(selected.id, payload); toast.success("更新しました") }
      else { await jobsApi.create(payload); toast.success("追加しました") }
      setModal(false); await loadAll()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleToggle = async (job: any) => {
    try {
      await jobsApi.update(job.id, { active: !job.active })
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, active: !j.active } : j))
    } catch { toast.error("更新に失敗しました") }
  }

  const handleDelete = async () => {
    try { await jobsApi.delete(deleteTarget.id); toast.success("削除しました"); setDeleteTarget(null); await loadAll() }
    catch (e: any) { toast.error(e.message) }
  }

  const [filterCategory, setFilterCategory] = useState("")
  const [filterArea, setFilterArea] = useState("")
  const [filterStore, setFilterStore] = useState("")

  const getName = (t: any[]) => t?.[0]?.name || "—"

  const filteredJobs = jobs.filter(j => {
    if (filterCategory && filterCategory !== "__all__" && j.category !== filterCategory) return false
    if (filterArea && filterArea !== "__all__" && j.location !== filterArea) return false
    if (filterStore && filterStore !== "__all__" && j.placeId !== filterStore) return false
    return true
  })

  return (
    <div>
      <PageHeader title="求人管理">
        <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />追加</Button>
      </PageHeader>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44"><SelectValue placeholder="カテゴリ（すべて）" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">カテゴリ（すべて）</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.translations?.[0]?.name || c.slug}>
                {c.translations?.[0]?.name || c.slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-44"><SelectValue placeholder="エリア（すべて）" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">エリア（すべて）</SelectItem>
            {areas.map(a => (
              <SelectItem key={a.id} value={a.translations?.[0]?.name || a.slug}>
                {a.translations?.[0]?.name || a.slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="w-44"><SelectValue placeholder="店舗（すべて）" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">店舗（すべて）</SelectItem>
            {stores.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.translations?.[0]?.name || s.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>会社名</TableHead>
              <TableHead>求人タイトル</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>エリア</TableHead>
              <TableHead>店舗</TableHead>
              <TableHead>有効</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">読み込み中...</TableCell></TableRow>
            ) : filteredJobs.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">該当する求人がありません</TableCell></TableRow>
            ) : filteredJobs.map(job => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.company}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.category || "—"}</TableCell>
                <TableCell>{job.location || "—"}</TableCell>
                <TableCell>{job.place ? getName(job.place.translations) : "—"}</TableCell>
                <TableCell><Switch checked={job.active} onCheckedChange={() => handleToggle(job)} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(job)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(job)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected ? "求人編集" : "求人追加"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>会社名 *</Label>
              <Input value={form.company} onChange={e => f("company", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>求人タイトル *</Label>
              <Input value={form.title} onChange={e => f("title", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>カテゴリ</Label>
              <Select value={form.category || "__none__"} onValueChange={v => f("category", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">未選択</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.translations?.[0]?.name || c.slug}>
                      {c.translations?.[0]?.name || c.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>エリア</Label>
              <Select value={form.location || "__none__"} onValueChange={v => f("location", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">未選択</SelectItem>
                  {areas.map(a => (
                    <SelectItem key={a.id} value={a.translations?.[0]?.name || a.slug}>
                      {a.translations?.[0]?.name || a.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>関連店舗</Label>
              <Select value={form.placeId || "__none__"} onValueChange={v => f("placeId", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="選択してください（任意）" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">なし</SelectItem>
                  {stores.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.translations?.[0]?.name || s.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>求人情報</Label>
              <Textarea
                value={form.description}
                onChange={e => f("description", e.target.value)}
                placeholder="給与・勤務時間・応募条件など"
                rows={6}
              />
            </div>
            <div className="space-y-1">
              <Label>求人画像</Label>
              {(form as any).imageUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border mb-2">
                  <img src={(form as any).imageUrl} alt="求人画像" className="w-full h-full object-cover" />
                  <button onClick={() => f("imageUrl", "")} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70">✕</button>
                </div>
              )}
              <ImageUploader onChange={url => f("imageUrl", url)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="求人削除" description={`「${deleteTarget?.title}」を削除しますか？`}
        confirmLabel="削除" destructive
      />
    </div>
  )
}
