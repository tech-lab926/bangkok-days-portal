"use client"

import { useEffect, useState } from "react"
import { areasApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { FixedSaveButton } from "@/components/admin/fixed-save-button"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowUp, ArrowDown, Plus, Trash2, ExternalLink, Pencil } from "lucide-react"
import { ImageUploader } from "@/components/admin/image-uploader"
import { toast } from "sonner"

interface AreaItem {
  id: string
  slug: string
  displayOrder: number
  enabled: boolean
  name: string
  imageUrl?: string
  description?: string
  ratingJapanese?: number
  ratingNightlife?: number
  ratingBeginner?: number
  ratingNightCaution?: number
  _count?: { places: number }
}

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaItem[]>([])
  const [original, setOriginal] = useState<AreaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newRatings, setNewRatings] = useState({ ratingJapanese: 0, ratingNightlife: 0, ratingBeginner: 0, ratingNightCaution: 0 })
  const [newBtsStation, setNewBtsStation] = useState("")
  const [newGoogleMapsUrl, setNewGoogleMapsUrl] = useState("")
  const [newSeoTitle, setNewSeoTitle] = useState("")
  const [newSeoDescription, setNewSeoDescription] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AreaItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editTarget, setEditTarget] = useState<AreaItem | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const fetchAreas = async () => {
    try {
      setLoading(true)
      const data = await areasApi.list()
      const mapped = data.map((a: any) => ({
        id: a.id,
        slug: a.slug,
        displayOrder: a.displayOrder,
        enabled: a.enabled,
        name: a.translations?.[0]?.name || "",
        imageUrl: a.imageUrl || "",
        description: a.description || "",
        btsStation: a.btsStation || "",
        googleMapsUrl: a.googleMapsUrl || "",
        seoTitle: a.seoTitle || "",
        seoDescription: a.seoDescription || "",
        ratingJapanese: a.ratingJapanese ?? 0,
        ratingNightlife: a.ratingNightlife ?? 0,
        ratingBeginner: a.ratingBeginner ?? 0,
        ratingNightCaution: a.ratingNightCaution ?? 0,
        _count: a._count,
      }))
      setAreas(mapped)
      setOriginal(JSON.parse(JSON.stringify(mapped)))
    } catch {
      toast.error("エリアの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAreas()
  }, [])

  const hasChanges = JSON.stringify(areas) !== JSON.stringify(original)

  const moveUp = (index: number) => {
    if (index === 0) return
    const newAreas = [...areas]
    ;[newAreas[index - 1], newAreas[index]] = [newAreas[index], newAreas[index - 1]]
    newAreas.forEach((a, i) => (a.displayOrder = i))
    setAreas(newAreas)
  }

  const moveDown = (index: number) => {
    if (index === areas.length - 1) return
    const newAreas = [...areas]
    ;[newAreas[index], newAreas[index + 1]] = [newAreas[index + 1], newAreas[index]]
    newAreas.forEach((a, i) => (a.displayOrder = i))
    setAreas(newAreas)
  }

  const updateArea = (index: number, field: string, value: any) => {
    setAreas((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await areasApi.bulkUpdate(
        areas.map((a) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          displayOrder: a.displayOrder,
          enabled: a.enabled,
        }))
      )
      setOriginal(JSON.parse(JSON.stringify(areas)))
      toast.success("エリア設定を保存しました")
    } catch (err: any) {
      toast.error(err.message || "保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!newName || !newSlug) {
      toast.error("エリア名とスラッグは必須です")
      return
    }
    setAddLoading(true)
    try {
      await areasApi.create({
        name: newName,
        slug: newSlug,
        displayOrder: areas.length,
        imageUrl: newImageUrl,
        description: newDescription,
        btsStation: newBtsStation,
        googleMapsUrl: newGoogleMapsUrl,
        seoTitle: newSeoTitle,
        seoDescription: newSeoDescription,
        ...newRatings,
      })
      setAddModal(false)
      setNewName("")
      setNewSlug("")
      setNewImageUrl("")
      setNewDescription("")
      setNewBtsStation("")
      setNewGoogleMapsUrl("")
      setNewSeoTitle("")
      setNewSeoDescription("")
      setNewRatings({ ratingJapanese: 0, ratingNightlife: 0, ratingBeginner: 0, ratingNightCaution: 0 })
      await fetchAreas()
      toast.success("エリアを追加しました")
    } catch (err: any) {
      toast.error(err.message || "追加に失敗しました")
    } finally {
      setAddLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await areasApi.delete(deleteTarget.id)
      setDeleteModal(false)
      setDeleteTarget(null)
      await fetchAreas()
      toast.success("エリアを削除しました")
    } catch (err: any) {
      toast.error(err.message || "削除に失敗しました")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEditSave = async () => {
    if (!editTarget) return
    setEditLoading(true)
    try {
      await areasApi.update(editTarget.id, {
        imageUrl: editTarget.imageUrl,
        description: editTarget.description,
        seoTitle: (editTarget as any).seoTitle,
        seoDescription: (editTarget as any).seoDescription,
        googleMapsUrl: (editTarget as any).googleMapsUrl,
        btsStation: (editTarget as any).btsStation,
        ratingJapanese: editTarget.ratingJapanese,
        ratingNightlife: editTarget.ratingNightlife,
        ratingBeginner: editTarget.ratingBeginner,
        ratingNightCaution: editTarget.ratingNightCaution,
      })
      setEditModal(false)
      await fetchAreas()
      toast.success("エリア情報を保存しました")
    } catch (err: any) {
      toast.error(err.message || "保存に失敗しました")
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="エリア設定">
        <a href="/area" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <ExternalLink className="mr-1 h-4 w-4" />
            公開ページを見る
          </Button>
        </a>
        <Button onClick={() => setAddModal(true)}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>エリア名</TableHead>
              <TableHead>slug</TableHead>
              <TableHead className="w-24">表示順</TableHead>
              <TableHead className="w-24">有効/無効</TableHead>
              <TableHead className="w-20">詳細編集</TableHead>
              <TableHead className="w-20">削除</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : (
              areas.map((area, index) => (
                <TableRow key={area.id}>
                  <TableCell>
                    <Input
                      value={area.name}
                      onChange={(e) => updateArea(index, "name", e.target.value)}
                      className="max-w-60"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={area.slug}
                      onChange={(e) => updateArea(index, "slug", e.target.value)}
                      className="max-w-40"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveUp(index)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveDown(index)} disabled={index === areas.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={area.enabled}
                      onCheckedChange={(v) => updateArea(index, "enabled", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setEditTarget({...area}); setEditModal(true) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setDeleteTarget(area)
                        setDeleteModal(true)
                      }}
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

      <FixedSaveButton onClick={handleSave} disabled={!hasChanges} loading={saving} />

      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>エリア追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>エリア名 *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>slug *（半角英数字・ハイフン）</Label>
              <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>エリア画像</Label>
              {newImageUrl && <img src={newImageUrl} alt="preview" className="h-24 w-full rounded-md object-cover border" />}
              <ImageUploader value={newImageUrl} onChange={setNewImageUrl} />
            </div>
            <div className="space-y-2">
              <Label>エリア説明</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="エリアの説明文..."
              />
            </div>
            <div className="space-y-3">
              <Label>評価（0〜5）</Label>
              {[
                { key: "ratingJapanese", label: "日本人の多さ" },
                { key: "ratingNightlife", label: "夜の賑わい" },
                { key: "ratingBeginner", label: "初心者向け" },
                { key: "ratingNightCaution", label: "ナイト注意度" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <Label className="w-32 shrink-0 text-sm">{label}</Label>
                  <Input
                    type="number" min={0} max={5} className="w-20"
                    value={(newRatings as any)[key]}
                    onChange={(e) => setNewRatings({ ...newRatings, [key]: parseInt(e.target.value) || 0 })}
                  />
                  <span className="text-[#f6b900]">{"★".repeat(Math.min(5, (newRatings as any)[key]))}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Google Maps URL</Label>
              <Input value={newGoogleMapsUrl} onChange={(e) => setNewGoogleMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
            <div className="space-y-2">
              <Label>SEOタイトル</Label>
              <Input value={newSeoTitle} onChange={(e) => setNewSeoTitle(e.target.value)} placeholder="例: アソークエリアの日本人向け店舗一覧" />
            </div>
            <div className="space-y-2">
              <Label>meta description</Label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                value={newSeoDescription} onChange={(e) => setNewSeoDescription(e.target.value)} placeholder="120文字以内推奨" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModal(false)}>キャンセル</Button>
            <Button onClick={handleAdd} disabled={addLoading}>
              {addLoading ? "追加中..." : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit content modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>エリア詳細編集 — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label>エリア画像</Label>
                {editTarget.imageUrl && (
                  <img src={editTarget.imageUrl} alt="preview" className="h-24 w-full rounded-md object-cover border" />
                )}
                <ImageUploader
                  value={editTarget.imageUrl}
                  onChange={(url) => setEditTarget({...editTarget, imageUrl: url})}
                />
              </div>
              <div className="space-y-2">
                <Label>エリア説明</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                  value={editTarget.description || ""}
                  onChange={(e) => setEditTarget({...editTarget, description: e.target.value})}
                  placeholder="エリアの説明文..."
                />
              </div>
              <div className="space-y-2">
                <Label>Google Maps URL</Label>
                <Input
                  value={(editTarget as any).googleMapsUrl || ""}
                  onChange={(e) => setEditTarget({...editTarget, googleMapsUrl: e.target.value} as any)}
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>SEOタイトル（未入力時は自動生成）</Label>
                <Input
                  value={(editTarget as any).seoTitle || ""}
                  onChange={(e) => setEditTarget({...editTarget, seoTitle: e.target.value} as any)}
                  placeholder="例: アソークエリアの日本人向け店舗一覧"
                />
              </div>
              <div className="space-y-2">
                <Label>meta description</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                  value={(editTarget as any).seoDescription || ""}
                  onChange={(e) => setEditTarget({...editTarget, seoDescription: e.target.value} as any)}
                  placeholder="120文字以内推奨"
                />
              </div>
              <div className="space-y-3">
                <Label>評価（0〜5）</Label>
                {[
                  { key: "ratingJapanese", label: "日本人の多さ" },
                  { key: "ratingNightlife", label: "夜の賑わい" },
                  { key: "ratingBeginner", label: "初心者向け" },
                  { key: "ratingNightCaution", label: "ナイト注意度" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Label className="w-32 shrink-0 text-sm">{label}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      className="w-20"
                      value={(editTarget as any)[key] ?? 0}
                      onChange={(e) => setEditTarget({...editTarget, [key]: parseInt(e.target.value) || 0})}
                    />
                    <span className="text-[#f6b900]">{"★".repeat(Math.min(5, (editTarget as any)[key] ?? 0))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(false)}>キャンセル</Button>
            <Button onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>エリア削除確認</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            エリア「{deleteTarget?.name}」を削除してもよろしいですか？
            {deleteTarget?._count && deleteTarget._count.places > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                このエリアには{deleteTarget._count.places}件の店舗が関連付けられています。
              </span>
            )}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModal(false)
                setDeleteTarget(null)
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
