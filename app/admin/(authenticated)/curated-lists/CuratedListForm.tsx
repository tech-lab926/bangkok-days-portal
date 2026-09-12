"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { FixedSaveButton } from "@/components/admin/fixed-save-button"
import { ImageUploader } from "@/components/admin/image-uploader"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, GripVertical, Search } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface Props {
  initialData?: any
  id?: string
}

export default function CuratedListForm({ initialData, id }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    coverUrl: initialData?.coverUrl || "",
    published: initialData?.published ?? false,
  })
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>(
    initialData?.places?.map((p: any) => p.place) || []
  )
  const [allPlaces, setAllPlaces] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filterArea, setFilterArea] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/v1/admin/stores?limit=500")
      .then(r => r.json())
      .then(j => setAllPlaces(j.data?.items || j.data || []))
      .catch(() => {})
  }, [])

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const filteredPlaces = allPlaces.filter(p => {
    const name = p.translations?.[0]?.name || p.slug
    const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase())
    const matchesArea = !filterArea || p.areaId === filterArea
    const matchesCategory = !filterCategory || p.categories?.some((c: any) => c.categoryId === filterCategory)
    return matchesSearch && matchesArea && matchesCategory &&
      !selectedPlaces.find(s => s.id === p.id)
  })

  const addPlace = (place: any) => setSelectedPlaces(prev => [...prev, place])
  const removePlace = (id: string) => setSelectedPlaces(prev => prev.filter(p => p.id !== id))

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error("タイトルとスラッグは必須です"); return }
    setSaving(true)
    try {
      const body = { ...form, placeIds: selectedPlaces.map(p => p.id) }
      const res = await fetch(
        id ? `/api/v1/admin/curated-lists/${id}` : "/api/v1/admin/curated-lists",
        { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      )
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("保存しました")
      router.push("/admin/curated-lists")
    } catch (e: any) {
      toast.error(e.message || "保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader title={id ? "特集編集" : "特集新規作成"} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: main fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">基本情報</h2>
            <div className="space-y-1">
              <Label>タイトル *</Label>
              <Input value={form.title} onChange={e => f("title", e.target.value)} placeholder="例: エカマイのおすすめバー20選" />
            </div>
            <div className="space-y-1">
              <Label>スラッグ * <span className="text-xs text-muted-foreground">（URL: /featured/スラッグ）</span></Label>
              <Input value={form.slug} onChange={e => f("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="ekkamai-bar-top20" />
            </div>
            <div className="space-y-1">
              <Label>説明文</Label>
              <TiptapEditor content={form.description} onChange={v => f("description", v)} />
            </div>
            <div className="space-y-1">
              <Label>カバー画像</Label>
              {form.coverUrl && <img src={form.coverUrl} alt="" className="h-32 w-full rounded-lg object-cover border" />}
              <ImageUploader onChange={url => f("coverUrl", url)} />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">SEO設定</h2>
            <div className="space-y-1">
              <Label>SEOタイトル <span className="text-xs text-muted-foreground">（未入力時はタイトルを使用）</span></Label>
              <Input value={form.seoTitle} onChange={e => f("seoTitle", e.target.value)} placeholder="例: バンコク エカマイ おすすめバー20選 | Site Bang" />
            </div>
            <div className="space-y-1">
              <Label>meta description</Label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                value={form.seoDescription} onChange={e => f("seoDescription", e.target.value)}
                placeholder="120文字以内推奨" />
            </div>
          </div>
        </div>

        {/* Right: publish + store picker */}
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">公開設定</h2>
            <div className="flex items-center justify-between">
              <Label>公開する</Label>
              <Switch checked={form.published} onCheckedChange={v => f("published", v)} />
            </div>
            {form.slug && (
              <p className="text-xs text-muted-foreground break-all">URL: /featured/{form.slug}</p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              掲載店舗 <Badge variant="outline" className="ml-1">{selectedPlaces.length}件</Badge>
            </h2>

            {/* Selected stores */}
            {selectedPlaces.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedPlaces.map((place, i) => {
                  const name = place.translations?.[0]?.name || place.slug
                  const img = place.images?.[0]?.url
                  return (
                    <div key={place.id} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2 py-1.5">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}</span>
                      {img && <Image src={img} alt={name} width={32} height={32} className="rounded object-cover shrink-0" />}
                      <span className="text-sm flex-1 truncate">{name}</span>
                      <button onClick={() => removePlace(place.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-2">
              <select className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                value={filterArea} onChange={e => setFilterArea(e.target.value)}>
                <option value="">エリア（すべて）</option>
                {[...new Set(allPlaces.map(p => p.areaId).filter(Boolean))].map(areaId => {
                  const place = allPlaces.find(p => p.areaId === areaId)
                  const areaName = place?.area?.translations?.[0]?.name || areaId
                  return <option key={areaId} value={areaId}>{areaName}</option>
                })}
              </select>
              <select className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">カテゴリ（すべて）</option>
                {[...new Set(allPlaces.flatMap(p => p.categories?.map((c: any) => c.categoryId) || []))].map(catId => {
                  const place = allPlaces.find(p => p.categories?.some((c: any) => c.categoryId === catId))
                  const catName = place?.categories?.find((c: any) => c.categoryId === catId)?.category?.translations?.[0]?.name || catId
                  return <option key={catId} value={catId}>{catName}</option>
                })}
              </select>
            </div>

            {/* Search & add */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="店舗を検索して追加..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(search || filterArea || filterCategory) && (
              <div className="max-h-48 overflow-y-auto rounded-lg border bg-background divide-y">
                {filteredPlaces.slice(0, 20).map(place => {
                  const name = place.translations?.[0]?.name || place.slug
                  const img = place.images?.[0]?.url
                  return (
                    <button key={place.id} onClick={() => { addPlace(place); setSearch("") }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition">
                      {img && <Image src={img} alt={name} width={28} height={28} className="rounded object-cover shrink-0" />}
                      <span className="text-sm truncate">{name}</span>
                    </button>
                  )
                })}
                {filteredPlaces.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">見つかりません</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <FixedSaveButton onClick={handleSave} loading={saving} />
    </div>
  )
}
