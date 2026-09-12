"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, Pencil, X } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { areasApi } from "@/lib/admin-api";

type TodayEvent = {
  id: string;
  eventTime: string;
  area: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  eventDate: string;
  active: boolean;
  contactUrl: string | null;
  lineId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { eventTime: "", area: "", title: "", description: "", imageUrls: [] as string[], eventDate: today(), contactUrl: "", lineId: "", contactEmail: "", contactPhone: "" };

export default function TodayEventsPage() {
  const [events, setEvents] = useState<TodayEvent[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TodayEvent | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/v1/admin/today-events");
    const json = await res.json();
    setEvents(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    areasApi.list().then(a => setAreas(a.filter((x: any) => x.enabled))).catch(() => {});
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (ev: TodayEvent) => {
    setEditing(ev);
    setForm({ eventTime: ev.eventTime, area: ev.area, title: ev.title, description: ev.description || "", imageUrls: ev.imageUrls || [], eventDate: ev.eventDate?.slice(0, 10) || today(), contactUrl: ev.contactUrl || "", lineId: ev.lineId || "", contactEmail: ev.contactEmail || "", contactPhone: ev.contactPhone || "" });
    setModal(true);
  };

  const save = async () => {
    if (!form.eventTime || !form.area || !form.title || !form.eventDate) { toast.error("必須項目を入力してください"); return; }
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch("/api/v1/admin/today-events", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editing ? "更新しました" : "追加しました");
      setModal(false);
      load();
    } else {
      toast.error("保存に失敗しました");
    }
    setSaving(false);
  };

  const toggle = async (ev: TodayEvent) => {
    await fetch("/api/v1/admin/today-events", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ev.id, active: !ev.active }) });
    load();
  };

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const remove = async () => {
    if (!deleteTarget) return
    try { await fetch("/api/v1/admin/today-events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteTarget }) });
      toast.success("削除しました"); setDeleteTarget(null); load() }
    catch { toast.error("削除に失敗しました") }
  }

  const addImage = (url: string) => setForm(f => ({ ...f, imageUrls: [...f.imageUrls, url].slice(0, 4) }));
  const removeImage = (i: number) => setForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }));

  return (
    <div className="space-y-6">
      <PageHeader title="イベント管理">
        <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />追加</Button>
      </PageHeader>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">日付</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">時間</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">エリア</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">タイトル</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">状態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">読み込み中...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">イベントがありません</td></tr>
            ) : events.map((ev) => (
              <tr key={ev.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 text-muted-foreground">{ev.eventDate?.slice(0, 10)}</td>
                <td className="px-4 py-3 font-semibold text-primary">{ev.eventTime}</td>
                <td className="px-4 py-3"><span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs">{ev.area}</span></td>
                <td className="px-4 py-3">{ev.title}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ev.active ? "bg-green-100 text-green-700" : (ev as any).submittedBy ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                    {ev.active ? "公開中" : (ev as any).submittedBy ? "承認待ち" : "非表示"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(ev)} className="text-muted-foreground hover:text-foreground transition"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => toggle(ev)} className="text-muted-foreground hover:text-foreground transition">
                      {ev.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setDeleteTarget(ev.id)} className="text-destructive hover:text-destructive/80 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "イベント編集" : "イベント追加"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>日付 *</Label>
                <input type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <Label>時間 *</Label>
                <input type="text" placeholder="19:00" value={form.eventTime} onChange={e => setForm(f => ({ ...f, eventTime: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>エリア *</Label>
              <Select value={form.area} onValueChange={v => setForm(f => ({ ...f, area: v }))}>
                <SelectTrigger><SelectValue placeholder="エリアを選択" /></SelectTrigger>
                <SelectContent>
                  {areas.map((a: any) => (
                    <SelectItem key={a.id} value={a.translations?.[0]?.name || a.slug}>
                      {a.translations?.[0]?.name || a.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>タイトル *</Label>
              <input type="text" placeholder="駐在向け飲み会" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <Label>詳細（HTML編集可）</Label>
              <TiptapEditor content={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
            </div>
            <div className="space-y-2">
              <Label>画像（最大4枚）</Label>
              <div className="flex flex-wrap gap-2">
                {form.imageUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-16 rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"><X className="h-2.5 w-2.5" /></button>
                  </div>
                ))}
              </div>
              {form.imageUrls.length < 4 && <ImageUploader onChange={addImage} />}
            </div>
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">連絡先（入力した項目のみ表示されます）</p>
              <div className="space-y-1">
                <Label>URL（サイト・SNS・LINE等）</Label>
                <input type="url" placeholder="https://..." value={form.contactUrl} onChange={e => setForm(f => ({ ...f, contactUrl: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <Label>LINE ID</Label>
                <input type="text" placeholder="@lineid" value={form.lineId} onChange={e => setForm(f => ({ ...f, lineId: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <Label>メール</Label>
                <input type="email" placeholder="example@email.com" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <Label>電話</Label>
                <input type="tel" placeholder="+66-XX-XXX-XXXX" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>キャンセル</Button>
            <Button onClick={save} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>イベント削除</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">このイベントを削除しますか？この操作は元に戻せません。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
            <Button variant="destructive" onClick={remove}>削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
