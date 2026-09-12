"use client"

import { useEffect, useState } from "react"
import { categoriesApi } from "@/lib/admin-api"
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
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Plus, Trash2, Pencil } from "lucide-react"
import { ImageUploader } from "@/components/admin/image-uploader"
import { toast } from "sonner"

interface CategoryItem {
  id: string
  slug: string
  displayOrder: number
  enabled: boolean
  name: string
  description?: string
  seoTitle?: string
  seoDescription?: string
  imageUrl?: string
  _count?: { places: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [original, setOriginal] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newSeoTitle, setNewSeoTitle] = useState("")
  const [newSeoDescription, setNewSeoDescription] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoryItem | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoriesApi.list()
      const mapped = data.map((c: any) => ({
        id: c.id,
        slug: c.slug,
        displayOrder: c.displayOrder,
        enabled: c.enabled,
        name: c.translations?.[0]?.name || "",
        description: c.description || "",
        seoTitle: c.seoTitle || "",
        seoDescription: c.seoDescription || "",
        imageUrl: c.imageUrl || "",
        _count: c._count,
      }))
      setCategories(mapped)
      setOriginal(JSON.parse(JSON.stringify(mapped)))
    } catch {
      toast.error("カテゴリの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const hasChanges = JSON.stringify(categories) !== JSON.stringify(original)

  const moveUp = (index: number) => {
    if (index === 0) return
    const items = [...categories]
    ;[items[index - 1], items[index]] = [items[index], items[index - 1]]
    items.forEach((a, i) => (a.displayOrder = i))
    setCategories(items)
  }

  const moveDown = (index: number) => {
    if (index === categories.length - 1) return
    const items = [...categories]
    ;[items[index], items[index + 1]] = [items[index + 1], items[index]]
    items.forEach((a, i) => (a.displayOrder = i))
    setCategories(items)
  }

  const updateItem = (index: number, field: string, value: any) => {
    setCategories((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await categoriesApi.bulkUpdate(
        categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: (c as any).slug,
          displayOrder: c.displayOrder,
          enabled: c.enabled,
        }))
      )
      setOriginal(JSON.parse(JSON.stringify(categories)))
      toast.success("カテゴリ設定を保存しました")
    } catch (err: any) {
      toast.error(err.message || "保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!newName) {
      toast.error("カテゴリ名は必須です")
      return
    }
    setAddLoading(true)
    try {
      await categoriesApi.create({
        name: newName,
        slug: newSlug,
        description: newDescription,
        seoTitle: newSeoTitle,
        seoDescription: newSeoDescription,
        imageUrl: newImageUrl,
        displayOrder: categories.length,
      })
      setAddModal(false)
      setNewName(""); setNewSlug(""); setNewDescription(""); setNewSeoTitle(""); setNewSeoDescription(""); setNewImageUrl("")
      await fetchCategories()
      toast.success("カテゴリを追加しました")
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
      await categoriesApi.delete(deleteTarget.id)
      setDeleteModal(false)
      setDeleteTarget(null)
      await fetchCategories()
      toast.success("カテゴリを削除しました")
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
      await categoriesApi.update(editTarget.id, {
        slug: editTarget.slug,
        description: editTarget.description,
        seoTitle: editTarget.seoTitle,
        seoDescription: editTarget.seoDescription,
        imageUrl: editTarget.imageUrl,
      })
      setEditModal(false)
      await fetchCategories()
      toast.success("カテゴリ情報を保存しました")
    } catch (err: any) {
      toast.error(err.message || "保存に失敗しました")
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="カテゴリ設定">
        <Button onClick={() => setAddModal(true)}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>カテゴリ名</TableHead>
              <TableHead>スラッグ</TableHead>
              <TableHead className="w-24">表示順</TableHead>
              <TableHead className="w-24">有効/無効</TableHead>
              <TableHead className="w-24">使用店舗数</TableHead>
              <TableHead className="w-20">SEO編集</TableHead>
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
              categories.map((cat, index) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <Input
                      value={cat.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      className="max-w-60"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={(cat as any).slug || ""}
                      onChange={(e) => updateItem(index, "slug", e.target.value)}
                      className="max-w-40 text-sm text-muted-foreground"
                      placeholder="slug"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveUp(index)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveDown(index)} disabled={index === categories.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={cat.enabled}
                      onCheckedChange={(v) => updateItem(index, "enabled", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cat._count?.places ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => { setEditTarget(cat); setEditModal(true) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setDeleteTarget(cat)
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
            <DialogTitle>カテゴリ追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>カテゴリ名 *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>スラッグ（任意）</Label>
              <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="未入力ならカテゴリ名から自動生成" />
            </div>
            <div className="space-y-2">
              <Label>アイキャッチ画像</Label>
              {newImageUrl && <img src={newImageUrl} alt="preview" className="h-24 w-full rounded-md object-cover border" />}
              <ImageUploader onChange={setNewImageUrl} />
            </div>
            <div className="space-y-2">
              <Label>説明文</Label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="カテゴリの説明文..." />
            </div>
            <div className="space-y-2">
              <Label>SEOタイトル</Label>
              <Input value={newSeoTitle} onChange={e => setNewSeoTitle(e.target.value)} placeholder="例: バンコクのおすすめ居酒屋" />
            </div>
            <div className="space-y-2">
              <Label>meta description</Label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                value={newSeoDescription} onChange={e => setNewSeoDescription(e.target.value)} placeholder="120文字以内推奨" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModal(false)}>キャンセル</Button>
            <Button onClick={handleAdd} disabled={addLoading}>{addLoading ? "追加中..." : "追加"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリ削除確認</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            カテゴリ「{deleteTarget?.name}」を削除してもよろしいですか？
            {deleteTarget?._count && deleteTarget._count.places > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                このカテゴリには{deleteTarget._count.places}件の店舗が関連付けられています。
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

      {/* SEO Edit modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>カテゴリSEO編集 — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label>スラッグ</Label>
                <Input
                  value={editTarget.slug || ""}
                  onChange={(e) => setEditTarget({ ...editTarget, slug: e.target.value })}
                  placeholder="category-slug"
                />
              </div>
              <div className="space-y-2">
                <Label>アイキャッチ画像</Label>
                {editTarget.imageUrl && (
                  <img src={editTarget.imageUrl} alt="preview" className="h-24 w-full rounded-md object-cover border" />
                )}
                <ImageUploader onChange={(url) => setEditTarget({ ...editTarget, imageUrl: url })} />
              </div>
              <div className="space-y-2">
                <Label>説明文</Label>
                <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                  value={editTarget.description || ""}
                  onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
                  placeholder="カテゴリの説明文..." />
              </div>
              <div className="space-y-2">
                <Label>SEOタイトル（未入力時は自動生成）</Label>
                <Input value={editTarget.seoTitle || ""}
                  onChange={(e) => setEditTarget({ ...editTarget, seoTitle: e.target.value })}
                  placeholder="例: バンコクの居酒屋おすすめ" />
              </div>
              <div className="space-y-2">
                <Label>meta description</Label>
                <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                  value={editTarget.seoDescription || ""}
                  onChange={(e) => setEditTarget({ ...editTarget, seoDescription: e.target.value })}
                  placeholder="120文字以内推奨" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(false)}>キャンセル</Button>
            <Button onClick={handleEditSave} disabled={editLoading}>{editLoading ? "保存中..." : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
