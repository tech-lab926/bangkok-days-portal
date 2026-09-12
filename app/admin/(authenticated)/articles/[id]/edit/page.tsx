"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lang, setLang] = useState<"ja" | "en" | "th">("ja")
  const [allTags, setAllTags] = useState<any[]>([])
  const [data, setData] = useState({
    slug: "",
    type: "NEWS" as "NEWS" | "GUIDE",
    thumbnailUrl: "",
    published: false,
    featured: false,
    impactLevel: "" as "" | "HIGH" | "MEDIUM" | "LOW",
    newsCategory: "" as "" | "ALL" | "LIFE" | "TRANSPORT" | "BUSINESS" | "NIGHT" | "EVENT" | "SYSTEM",
    tagIds: [] as string[],
    translations: {
      ja: { title: "", content: "", excerpt: "" },
      en: { title: "", content: "", excerpt: "" },
      th: { title: "", content: "", excerpt: "" },
    },
  })

  useEffect(() => {
    tagsApi.list().then((d: any) => setAllTags(d.items || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const article = await articlesApi.get(params.id as string)
        const trans = {
          ja: { title: "", content: "", excerpt: "" },
          en: { title: "", content: "", excerpt: "" },
          th: { title: "", content: "", excerpt: "" },
        }
        article.translations?.forEach((t: any) => {
          trans[t.locale as keyof typeof trans] = { title: t.title, content: t.content, excerpt: t.excerpt || "" }
        })
        setData({
          slug: article.slug,
          type: article.type || "NEWS",
          thumbnailUrl: article.translations?.[0]?.coverUrl || "",
          published: article.published,
          featured: article.featured || false,
          impactLevel: article.impactLevel || "",
          newsCategory: article.newsCategory || "",
          tagIds: article.tags?.map((at: any) => at.tagId || at.tag?.id) || [],
          translations: trans,
        })
      } catch {
        toast.error("記事の取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [params.id])

  const toggleTag = (id: string) =>
    setData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }))

  const handleSave = async () => {
    try {
      setSaving(true)
      await articlesApi.update(params.id as string, {
        slug: data.slug,
        type: data.type,
        published: data.published,
        featured: data.featured,
        impactLevel: data.impactLevel || null,
        newsCategory: data.newsCategory || null,
        tagIds: data.tagIds,
        translations: [
          { locale: "ja", ...data.translations.ja, coverUrl: data.thumbnailUrl },
          { locale: "en", ...data.translations.en, coverUrl: data.thumbnailUrl },
          { locale: "th", ...data.translations.th, coverUrl: data.thumbnailUrl },
        ].filter((t) => t.title),
      })
      toast.success("記事を更新しました")
      // Redirect to the correct management page based on article type
      router.push(data.type === "GUIDE" ? "/admin/guide-articles" : "/admin/news")
    } catch {
      toast.error("記事の更新に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">読み込み中...</div>

  return (
    <div>
      <PageHeader title="記事編集">
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
            <Input value={data.slug} onChange={(e) => setData({ ...data, slug: e.target.value })} />
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
