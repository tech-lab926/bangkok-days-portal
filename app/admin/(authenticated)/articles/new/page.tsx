"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { articlesApi, tagsApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
import { ImageUploader } from "@/components/admin/image-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"

export default function NewArticlePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Pre-select type from ?type=GUIDE or ?type=NEWS query param
  const initialType = (searchParams.get("type") as "NEWS" | "GUIDE") === "GUIDE" ? "GUIDE" : "NEWS"

  const [saving, setSaving] = useState(false)
  const [lang, setLang] = useState<"ja" | "en" | "th">("ja")
  const [allTags, setAllTags] = useState<any[]>([])
  const [data, setData] = useState({
    slug: "",
    type: initialType,
    thumbnailUrl: "",
    published: false,
    featured: false,
    impactLevel: "" as "" | "HIGH" | "MEDIUM" | "LOW",
    newsCategory: "" as "" | "ALL" | "LIFE" | "TRANSPORT" | "BUSINESS" | "NIGHT" | "EVENT" | "SYSTEM",
    tagIds: [] as string[],
    seoTitle: "",
    seoDescription: "",
    ogTitle: "",
    ogImage: "",
    canonicalUrl: "",
    schemaType: "Article" as string,
    translations: {
      ja: { title: "", content: "", excerpt: "" },
      en: { title: "", content: "", excerpt: "" },
      th: { title: "", content: "", excerpt: "" },
    },
  })

  useEffect(() => {
    tagsApi.list().then((d: any) => setAllTags(d.items || [])).catch(() => {})
  }, [])

  const toggleTag = (id: string) =>
    setData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }))

  const handleSave = async () => {
    if (!data.slug || !data.translations.ja.title) {
      toast.error("スラッグとタイトル（日本語）は必須です")
      return
    }
    try {
      setSaving(true)
      await articlesApi.create({
        slug: data.slug,
        type: data.type,
        published: data.published,
        featured: data.featured,
        impactLevel: data.impactLevel || null,
        newsCategory: data.newsCategory || null,
        tagIds: data.tagIds,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        ogTitle: data.ogTitle || null,
        ogImage: data.ogImage || null,
        canonicalUrl: data.canonicalUrl || null,
        schemaType: data.schemaType || null,
        translations: [
          { locale: "ja", ...data.translations.ja, coverUrl: data.thumbnailUrl },
          { locale: "en", ...data.translations.en, coverUrl: data.thumbnailUrl },
          { locale: "th", ...data.translations.th, coverUrl: data.thumbnailUrl },
        ].filter((t) => t.title),
      })
      toast.success("記事を作成しました")
      // Redirect to the correct management page based on article type
      router.push(data.type === "GUIDE" ? "/admin/guide-articles" : "/admin/news")
    } catch {
      toast.error("記事の作成に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="記事作成">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </PageHeader>

      <div className="space-y-6 max-w-4xl">
        <div className="flex gap-2 border-b">
          {(["ja", "en", "th"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 ${lang === l ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
            >
              {l === "ja" ? "日本語" : l === "en" ? "English" : "ไทย"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label>スラッグ（URL）</Label>
            <Input value={data.slug} onChange={(e) => setData({ ...data, slug: e.target.value })} placeholder="article-slug" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>タイプ</Label>
              <select
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value as "NEWS" | "GUIDE" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="NEWS">ニュース</option>
                <option value="GUIDE">ガイド</option>
              </select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={data.published} onChange={(e) => setData({ ...data, published: e.target.checked })} />
                公開
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={data.featured} onChange={(e) => setData({ ...data, featured: e.target.checked })} />
                注目
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>影響度</Label>
              <select
                value={data.impactLevel}
                onChange={(e) => setData({ ...data, impactLevel: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">なし</option>
                <option value="HIGH">影響あり（赤）</option>
                <option value="MEDIUM">少し影響（黄）</option>
                <option value="LOW">影響なし（緑）</option>
              </select>
            </div>
            <div className="flex-1">
              <Label>カテゴリ</Label>
              <select
                value={data.newsCategory}
                onChange={(e) => setData({ ...data, newsCategory: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">なし</option>
                <option value="LIFE">生活</option>
                <option value="TRANSPORT">交通・移動</option>
                <option value="BUSINESS">営業・店舗</option>
                <option value="NIGHT">ナイト</option>
                <option value="EVENT">イベント</option>
                <option value="SYSTEM">制度・重要情報</option>
              </select>
            </div>
          </div>

          <div>
            <Label>タグ</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {allTags.map((tag: any) => {
                const name = tag.translations?.find((t: any) => t.locale === "ja")?.name || tag.slug
                const selected = data.tagIds.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:border-primary"
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
              {allTags.length === 0 && <p className="text-xs text-muted-foreground">タグがありません</p>}
            </div>
            {data.tagIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {data.tagIds.map((id) => {
                  const tag = allTags.find((t: any) => t.id === id)
                  const name = tag?.translations?.find((t: any) => t.locale === "ja")?.name || id
                  return (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTag(id)} />
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <Label>サムネイル画像</Label>
            <ImageUploader value={data.thumbnailUrl} onChange={(url) => setData({ ...data, thumbnailUrl: url })} />
          </div>

          {/* SEO設定 */}
          <div className="rounded-lg border p-4 space-y-4 bg-muted/30">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">SEO設定</h3>
            <div className="space-y-1">
              <Label>SEOタイトル <span className="text-xs text-muted-foreground">({data.seoTitle.length}/60)</span></Label>
              <Input value={data.seoTitle} onChange={e => setData({ ...data, seoTitle: e.target.value })} placeholder="未入力時はタイトルを使用" maxLength={60} />
            </div>
            <div className="space-y-1">
              <Label>メタディスクリプション <span className="text-xs text-muted-foreground">({data.seoDescription.length}/160)</span></Label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                value={data.seoDescription} onChange={e => setData({ ...data, seoDescription: e.target.value })} placeholder="未入力時は概要を使用" maxLength={160} />
            </div>
            <div className="space-y-1">
              <Label>OGPタイトル</Label>
              <Input value={data.ogTitle} onChange={e => setData({ ...data, ogTitle: e.target.value })} placeholder="未入力時はSEOタイトルを使用" />
            </div>
            <div className="space-y-1">
              <Label>OGP画像（サムネイルと別に設定可能）</Label>
              {data.ogImage && <img src={data.ogImage} alt="" className="h-20 w-full rounded object-cover border" />}
              <ImageUploader onChange={url => setData({ ...data, ogImage: url })} />
            </div>
            <div className="space-y-1">
              <Label>canonical URL</Label>
              <Input value={data.canonicalUrl} onChange={e => setData({ ...data, canonicalUrl: e.target.value })}
                placeholder={data.slug ? `https://bangkok-days.com/${data.type === "NEWS" ? "news" : "articles"}/${data.slug}` : "自動生成"} />
              <p className="text-xs text-muted-foreground">空欄で自動生成</p>
            </div>
            <div className="space-y-1">
              <Label>構造化データタイプ</Label>
              <select value={data.schemaType} onChange={e => setData({ ...data, schemaType: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Article">Article（通常記事）</option>
                <option value="HowTo">HowTo（手順記事）</option>
                <option value="FAQ">FAQ（よくある質問）</option>
              </select>
            </div>
          </div>

          <div>
            <Label>タイトル</Label>
            <Input
              value={data.translations[lang].title}
              onChange={(e) => setData({ ...data, translations: { ...data.translations, [lang]: { ...data.translations[lang], title: e.target.value } } })}
            />
          </div>

          <div>
            <Label>概要</Label>
            <Input
              value={data.translations[lang].excerpt}
              onChange={(e) => setData({ ...data, translations: { ...data.translations, [lang]: { ...data.translations[lang], excerpt: e.target.value } } })}
            />
          </div>

          <div>
            <Label>本文</Label>
            <TiptapEditor
              content={data.translations[lang].content}
              onChange={(content) => setData({ ...data, translations: { ...data.translations, [lang]: { ...data.translations[lang], content } } })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
