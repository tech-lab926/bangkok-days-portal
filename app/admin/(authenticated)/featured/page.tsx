"use client"

import { useEffect, useState } from "react"
import { featuredPagesApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { FixedSaveButton } from "@/components/admin/fixed-save-button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface FeaturedItem {
  id?: string
  title: string
  url: string
  displayOrder: number
  enabled: boolean
}

export default function FeaturedPage() {
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [original, setOriginal] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await featuredPagesApi.list()
      setItems(data)
      setOriginal(JSON.parse(JSON.stringify(data)))
    } catch {
      toast.error("データの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const hasChanges = JSON.stringify(items) !== JSON.stringify(original)

  const addItem = () => {
    if (items.length >= 5) {
      toast.error("最大5件までです")
      return
    }
    setItems([
      ...items,
      { title: "", url: "", displayOrder: items.length, enabled: true },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, displayOrder: i })))
  }

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    newItems.forEach((item, i) => (item.displayOrder = i))
    setItems(newItems)
  }

  const moveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    newItems.forEach((item, i) => (item.displayOrder = i))
    setItems(newItems)
  }

  const handleSave = async () => {
    for (const item of items) {
      if (!item.title || !item.url) {
        toast.error("タイトルとURLは必須です")
        return
      }
    }
    setSaving(true)
    try {
      await featuredPagesApi.save(items)
      setOriginal(JSON.parse(JSON.stringify(items)))
      toast.success("保存しました")
    } catch (err: any) {
      toast.error(err.message || "保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="人気ランキング・特集">
        <Button onClick={addItem} disabled={items.length >= 5}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </PageHeader>

      <p className="mb-4 text-sm text-muted-foreground">最大5件まで登録できます</p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ページタイトル</TableHead>
              <TableHead>ページURL</TableHead>
              <TableHead className="w-24">表示順</TableHead>
              <TableHead className="w-24">有効/無効</TableHead>
              <TableHead className="w-16">削除</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  登録されたページがありません
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell>
                    <Input
                      value={item.title}
                      onChange={(e) => updateItem(index, "title", e.target.value)}
                      placeholder="ページタイトル"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.url}
                      onChange={(e) => updateItem(index, "url", e.target.value)}
                      placeholder="https://"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveUp(index)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveDown(index)} disabled={index === items.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={(v) => updateItem(index, "enabled", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FixedSaveButton onClick={handleSave} disabled={!hasChanges} loading={saving} />
    </div>
  )
}
