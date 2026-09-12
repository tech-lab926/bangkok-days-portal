"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, Flag } from "lucide-react";

interface QaQuestion {
  id: string; title: string; hidden: boolean; closed: boolean; createdAt: string;
  author: { nickname: string | null; email: string } | null;
  _count: { answers: number; reports: number };
}

export default function AdminQaPage() {
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [hiddenFilter, setHiddenFilter] = useState("all");
  const [tab, setTab] = useState<"questions" | "reports">("questions");
  const [reports, setReports] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const qs = new URLSearchParams({ q });
    if (hiddenFilter !== "all") qs.set("hidden", hiddenFilter);
    const res = await fetch(`/api/v1/admin/qa?${qs}`);
    const json = await res.json();
    setQuestions(json.data?.questions || []);
    setTotal(json.data?.total || 0);
    setLoading(false);
  };

  const loadReports = async () => {
    const res = await fetch("/api/v1/admin/qa/reports");
    const json = await res.json();
    setReports(json.data || []);
  };

  useEffect(() => { if (tab === "questions") load(); else loadReports(); }, [tab, hiddenFilter]);

  const toggleHidden = async (item: QaQuestion) => {
    await fetch("/api/v1/admin/qa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, type: "question", hidden: !item.hidden }),
    });
    toast.success(item.hidden ? "表示しました" : "非表示にしました");
    load();
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("この質問を削除しますか？")) return;
    await fetch("/api/v1/admin/qa", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type: "question" }),
    });
    toast.success("削除しました");
    load();
  };

  const resolveReport = async (id: string, status: string) => {
    await fetch("/api/v1/admin/qa/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    toast.success("更新しました");
    loadReports();
  };

  return (
    <div>
      <PageHeader title="Q&A 管理" />

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("questions")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "questions" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
          質問一覧
        </button>
        <button onClick={() => setTab("reports")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === "reports" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
          <Flag className="h-4 w-4" />通報一覧
        </button>
      </div>

      {tab === "questions" && (
        <>
          <div className="flex gap-2 mb-4">
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="タイトルで検索..." className="max-w-xs"
              onKeyDown={e => e.key === "Enter" && load()} />
            <Select value={hiddenFilter} onValueChange={setHiddenFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="false">表示中</SelectItem>
                <SelectItem value="true">非表示</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={load} variant="secondary">検索</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>投稿者</TableHead>
                <TableHead>回答</TableHead>
                <TableHead>通報</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>日時</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">読み込み中...</TableCell></TableRow>
              ) : questions.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-xs">
                    <a href={`/qa/${item.id}`} target="_blank" className="hover:underline line-clamp-1 text-sm">{item.title}</a>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.author?.nickname || item.author?.email || "-"}</TableCell>
                  <TableCell>{item._count.answers}</TableCell>
                  <TableCell>
                    {item._count.reports > 0 && <Badge variant="destructive">{item._count.reports}</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.hidden && <Badge variant="outline">非表示</Badge>}
                      {item.closed && <Badge variant="secondary">クローズ</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(item.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => toggleHidden(item)} title={item.hidden ? "表示" : "非表示"} className="p-1 hover:text-primary">
                        {item.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => deleteQuestion(item.id)} className="p-1 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {tab === "reports" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>通報理由</TableHead>
              <TableHead>対象</TableHead>
              <TableHead>通報者</TableHead>
              <TableHead>日時</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm">{r.reason}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.question ? <a href={`/qa/${r.question.slug}`} target="_blank" className="hover:underline">{r.question.title}</a> : r.answer ? `回答: ${r.answer.content.slice(0, 40)}...` : "-"}
                </TableCell>
                <TableCell className="text-xs">{r.reporter?.nickname || r.reporter?.email || "不明"}</TableCell>
                <TableCell className="text-xs">{new Date(r.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                <TableCell>
                  <Badge variant={r.status === "PENDING" ? "destructive" : "secondary"}>{r.status === "PENDING" ? "未対応" : r.status === "RESOLVED" ? "対応済み" : "却下"}</Badge>
                </TableCell>
                <TableCell>
                  {r.status === "PENDING" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => resolveReport(r.id, "RESOLVED")}>対応済み</Button>
                      <Button size="sm" variant="ghost" onClick={() => resolveReport(r.id, "DISMISSED")}>却下</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
