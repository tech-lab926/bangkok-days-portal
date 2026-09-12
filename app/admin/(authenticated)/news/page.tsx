"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { articlesApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

const NEWS_CATEGORY_LABELS: Record<string, string> = {
  LIFE: "生活",
  TRANSPORT: "交通・移動",
  BUSINESS: "営業・店舗",
  NIGHT: "ナイト",
  EVENT: "イベント",
  SYSTEM: "制度・重要情報",
  ALL: "全般",
}

export default function NewsManagementPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = { type: "NEWS" }
      if (search) params.search = search
      const data = await articlesApi.list(params)
      setArticles(data.items || [])
    } catch {
      toast.error("ニュース一覧の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [search])

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await articlesApi.togglePublish(id, !current)
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, published: !current } : a))
      )
      toast.success("公開状態を更新しました")
    } catch {
      toast.error("公開状態の更新に失敗しました")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("このニュース記事を削除しますか？")) return
    try {
      await articlesApi.delete(id)
      setArticles((prev) => prev.filter((a) => a.id !== id))
      toast.success("ニュース記事を削除しました")
    } catch {
      toast.error("ニュース記事の削除に失敗しました")
    }
  }

  return (
    <div>
      <PageHeader title="ニュース管理">
        <Link href="/admin/articles/new?type=NEWS">
          <Button>新規作成</Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="タイトルで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>公開状態</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  ニュース記事がありません
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    {article.translations?.[0]?.title || "（タイトル未設定）"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {NEWS_CATEGORY_LABELS[article.newsCategory] || article.newsCategory || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={article.published}
                      onCheckedChange={() => handleTogglePublish(article.id, article.published)}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/articles/${article.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
