"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  displayOrder: number;
  _count?: { placeTags: number };
}

const EMPTY = { name: "", slug: "", category: "", displayOrder: 0 };

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TagItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<TagItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/tags");
      const json = await res.json();
      setTags((json.data || []).map((t: any) => ({
        id: t.id,
        name: t.translations?.[0]?.name || "",
        slug: t.slug,
        category: t.category || "",
        displayOrder: t.displayOrder ?? 0,
        _count: t._count,
      })));
    } catch { toast.error("タグの取得に失敗しました"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTags(); }, []);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, displayOrder: tags.length }); setModal(true); };
  const openEdit = (tag: TagItem) => { setEditing(tag); setForm({ name: tag.name, slug: tag.slug, category: tag.category, displayOrder: tag.displayOrder }); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("タグ名を入力してください"); return; }
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/v1/admin/tags", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(editing ? "更新しました" : "追加しました");
      setModal(false);
      fetchTags();
    } catch (e: any) { toast.error(e.message || "保存に失敗しました"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/v1/admin/tags?id=${deleteTarget.id}`, { method: "DELETE" });
      toast.success("削除しました");
      setDeleteTarget(null);
      fetchTags();
    } catch { toast.error("削除に失敗しました"); }
    finally { setDeleteLoading(false); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const newTags = [...tags];
    const target = index + dir;
    if (target < 0 || target >= newTags.length) return;
    [newTags[index], newTags[target]] = [newTags[target], newTags[index]];
    newTags.forEach((t, i) => (t.displayOrder = i));
    setTags(newTags);
    await fetch("/api/v1/admin/tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTags.map(t => ({ id: t.id, displayOrder: t.displayOrder }))),
    });
  };

  // Group by category
  const grouped = tags.reduce((acc, tag) => {
    const key = tag.category || "（カテゴリなし）";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tag);
    return acc;
  }, {} as Record<string, TagItem[]>);

  const existingCategories = [...new Set(tags.map(t => t.category).filter(Boolean))];

  return (
    <div>
      <PageHeader title="タグ管理">
        <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />追加</Button>
      </PageHeader>

      {loading ? (
        <p className="text-muted-foreground py-8 text-center">読み込み中...</p>
      ) : tags.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">タグがありません</p>
      ) : (
        Object.entries(grouped).map(([cat, catTags]) => (
          <div key={cat} className="mb-6">
            <h2 className="mb-2 text-sm font-bold text-muted-foreground uppercase tracking-wide">{cat}</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タグ名</TableHead>
                    <TableHead>スラッグ</TableHead>
                    <TableHead>使用数</TableHead>
                    <TableHead className="w-32">並べ替え</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catTags.map((tag) => {
                    const globalIndex = tags.findIndex(t => t.id === tag.id);
                    return (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tag.slug}</TableCell>
                        <TableCell><Badge variant="outline">{tag._count?.placeTags || 0}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => move(globalIndex, -1)} disabled={globalIndex === 0}><ArrowUp className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => move(globalIndex, 1)} disabled={globalIndex === tags.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(tag)}><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(tag)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))
      )}

      {/* Add/Edit modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "タグ編集" : "タグ追加"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>タグ名 *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例: グルメ" />
            </div>
            <div className="space-y-1">
              <Label>スラッグ（未入力時は自動生成）</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="例: gourmet" />
            </div>
            <div className="space-y-1">
              <Label>カテゴリ（任意）</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="例: 料理ジャンル" list="tag-categories" />
              <datalist id="tag-categories">
                {existingCategories.map(c => <option key={c} value={c} />)}
              </datalist>
              <p className="text-xs text-muted-foreground">既存カテゴリ: {existingCategories.join(", ") || "なし"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete modal */}
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>タグ削除</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">「{deleteTarget?.name}」を削除しますか？</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? "削除中..." : "削除"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
