"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Zap, Trash2, ExternalLink, Eye } from "lucide-react"
import { toast } from "sonner"

export default function AutoNewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [preview, setPreview] = useState<any>(null)

  // Settings
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [autoGenerate, setAutoGenerate] = useState(false)
  const [autoPublish, setAutoPublish] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  const load = async () => {
    setLoading(true)
    const [newsRes, settingsRes] = await Promise.all([
      fetch("/api/v1/admin/auto-news"),
      fetch("/api/v1/admin/settings"),
    ])
    const newsJson = await newsRes.json()
    const settingsJson = await settingsRes.json()
    setNews(newsJson.data || [])
    if (settingsJson.success) {
      const s = settingsJson.data
      setAutoGenerate(s.news_auto_generate === "true")
      setAutoPublish(s.news_auto_publish === "true")
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          news_auto_generate: String(autoGenerate),
          news_auto_publish: String(autoPublish),
        }),
      })
      toast.success("設定を保存しました")
    } catch { toast.error("保存に失敗しました") }
    finally { setSavingSettings(false) }
  }

  const generate = async () => {
    setGenerating(true)
    try {
      const body: any = { autoPublish }
      if (dateFrom) body.dateFrom = dateFrom
      if (dateTo) body.dateTo = dateTo
      const res = await fetch("/api/v1/admin/auto-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(65_000), // 65s — matches server deadline
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`${json.data.generated}件生成、${json.data.skippedCount || 0}件スキップ（重複・類似）`)
        load()
      } else {
        toast.error(json.error || "生成に失敗しました")
      }
    } catch (err: any) {
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        toast.error("タイムアウト：処理に時間がかかっています。しばらく待ってから再試行してください。")
      } else {
        toast.error("生成に失敗しました")
      }
    } finally { setGenerating(false) }
  }

  const togglePublish = async (article: any) => {
    await fetch(`/api/v1/admin/articles?id=${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !article.published }),
    })
    setNews(prev => prev.map(n => n.id === article.id ? { ...n, published: !n.published } : n))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await fetch(`/api/v1/admin/articles?id=${deleteTarget.id}`, { method: "DELETE" })
    toast.success("削除しました")
    setDeleteTarget(null)
    load()
  }

  return (
    <div>
      <PageHeader title="AI自動ニュース" />

      {/* Settings bar */}
      <div className="mb-6 rounded-md border p-4 space-y-4">
        {/* Date range + generate */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">開始日</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40 h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">終了日</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40 h-9" />
          </div>
          <Button onClick={generate} disabled={generating}>
            <Zap className="mr-1 h-4 w-4" />
            {generating ? "生成中..." : "ニュースを生成"}
          </Button>
        </div>

        {/* Auto settings */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} id="auto-gen" />
            <Label htmlFor="auto-gen" className="text-sm cursor-pointer">毎日自動生成</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={autoPublish} onCheckedChange={setAutoPublish} id="auto-pub" />
            <Label htmlFor="auto-pub" className="text-sm cursor-pointer">自動投稿（生成後すぐ公開）</Label>
          </div>
          <Button variant="outline" size="sm" onClick={saveSettings} disabled={savingSettings}>
            {savingSettings ? "保存中..." : "設定を保存"}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        RSSフィードからバンコク関連ニュースを取得し、AIで日本語にリライトします。
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>公開</TableHead>
              <TableHead>生成日</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">読み込み中...</TableCell></TableRow>
            ) : news.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">自動生成ニュースがありません。「ニュースを生成」ボタンを押してください。</TableCell></TableRow>
            ) : news.map(article => (
              <TableRow key={article.id}>
                <TableCell className="font-medium max-w-xs truncate">{article.translations?.[0]?.title || article.slug}</TableCell>
                <TableCell><Badge variant="outline">{article.newsCategory || "—"}</Badge></TableCell>
                <TableCell>
                  <Switch checked={article.published} onCheckedChange={() => togglePublish(article)} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(article.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setPreview(article)}><Eye className="h-4 w-4" /></Button>
                    {article.sourceUrl && (
                      <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                      </a>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(article)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!preview} onOpenChange={v => !v && setPreview(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{preview?.translations?.[0]?.title}</DialogTitle></DialogHeader>
          {preview && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{preview.translations?.[0]?.excerpt}</p>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: preview.translations?.[0]?.content || "" }} />
              {preview.sourceUrl && (
                <a href={preview.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">元記事を見る →</a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>ニュース削除</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">「{deleteTarget?.translations?.[0]?.title}」を削除しますか？</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleDelete}>削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
