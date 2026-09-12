"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Lock, Unlock, RotateCcw, Plus, X, Pencil, User, Flag, FileQuestion, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UserType = {
  id: string; email: string; fullName: string; nickname: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean; active: boolean; frozen: boolean; deletedAt: string | null;
  lastLoginAt: string | null; createdAt: string; totalLikesReceived: number;
  _count: { qaAnswers: number; qaQuestions: number };
};

type UserPost = {
  questions: { id: string; title: string; slug: string; createdAt: string; hidden: boolean }[];
  answers: { id: string; content: string; createdAt: string; hidden: boolean; questionId: string; question: { title: string; slug: string } }[];
};

type Report = {
  id: string; reason: string; status: string; createdAt: string;
  reporter: { id: string; nickname: string | null; email: string } | null;
  question: { id: string; slug: string; title: string } | null;
  answer: { id: string; content: string } | null;
};

export default function PublicUserManagementPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<"users" | "posts" | "reports" | "banned">("users");
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");

  // Edit dialog
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [editNickname, setEditNickname] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Posts tab
  const [postsUserId, setPostsUserId] = useState("");
  const [userPosts, setUserPosts] = useState<UserPost | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);

  // Reports tab
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    const qs = new URLSearchParams({ search, status, sortBy });
    const res = await fetch(`/api/v1/admin/public-users?${qs}`);
    const json = await res.json();
    if (json.success) setUsers(json.data);
    setLoading(false);
  };

  const fetchBanned = async () => {
    const res = await fetch("/api/v1/admin/banned-words");
    const json = await res.json();
    if (json.success) setBannedWords(json.data);
  };

  const fetchUserPosts = async (userId: string) => {
    if (!userId) return;
    setPostsLoading(true);
    const res = await fetch(`/api/v1/admin/public-users/posts?userId=${userId}`);
    const json = await res.json();
    if (json.success) setUserPosts(json.data);
    else toast.error("投稿の取得に失敗しました");
    setPostsLoading(false);
  };

  const fetchReports = async (st?: string) => {
    setReportsLoading(true);
    const filter = st || reportStatus;
    const qs = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/v1/admin/qa/reports${qs}`);
    const json = await res.json();
    if (json.success) setReports(json.data);
    setReportsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [status, sortBy]);
  useEffect(() => { if (tab === "banned") fetchBanned(); }, [tab]);
  useEffect(() => { if (tab === "reports") fetchReports(); }, [tab]);

  const patch = async (id: string, body: object, msg: string) => {
    const res = await fetch(`/api/v1/admin/public-users?id=${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) { toast.success(msg); fetchUsers(); }
    else toast.error(json.error || "エラーが発生しました");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/v1/admin/public-users?id=${deleteId}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("退会処理しました"); fetchUsers(); }
    else toast.error(json.error || "エラーが発生しました");
    setDeleteId(null);
  };

  const openEdit = (u: UserType) => {
    setEditUser(u);
    setEditNickname(u.nickname || "");
    setEditEmail(u.email);
    setEditFullName(u.fullName);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    const res = await fetch(`/api/v1/admin/public-users?id=${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: editNickname, email: editEmail, fullName: editFullName }),
    });
    const json = await res.json();
    if (json.success) { toast.success("更新しました"); setEditUser(null); fetchUsers(); }
    else toast.error(json.error || "更新に失敗しました");
    setEditSaving(false);
  };

  const handleDeleteAvatar = async (u: UserType) => {
    await patch(u.id, { avatarUrl: null }, "アバターを削除しました");
  };

  const saveBanned = async (words: string[]) => {
    await fetch("/api/v1/admin/banned-words", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words }),
    });
    setBannedWords(words);
    toast.success("保存しました");
  };

  const deletePost = async (id: string, type: "question" | "answer") => {
    if (!confirm(`この${type === "question" ? "質問" : "回答"}を削除しますか？`)) return;
    const res = await fetch("/api/v1/admin/qa", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("削除しました");
      if (postsUserId) fetchUserPosts(postsUserId);
    } else {
      toast.error(json.error || "削除に失敗しました");
    }
  };

  const resolveReport = async (id: string, newStatus: string) => {
    const res = await fetch("/api/v1/admin/qa/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    const json = await res.json();
    if (json.success) { toast.success("更新しました"); fetchReports(); }
    else toast.error("更新に失敗しました");
  };

  const deleteReportedPost = async (report: Report) => {
    if (!confirm("この投稿を削除しますか？")) return;
    if (report.question) {
      await fetch("/api/v1/admin/qa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.question.id, type: "question" }),
      });
    } else if (report.answer) {
      await fetch("/api/v1/admin/qa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.answer.id, type: "answer" }),
      });
    }
    // Mark as resolved too
    await resolveReport(report.id, "RESOLVED");
    toast.success("投稿を削除しました");
  };

  const getStatusBadge = (u: UserType) => {
    if (u.deletedAt) return <Badge variant="outline" className="text-xs">退会済み</Badge>;
    if (u.frozen) return <Badge variant="destructive" className="text-xs">凍結</Badge>;
    return <Badge variant="secondary" className="text-xs">正常</Badge>;
  };

  const getReportStatusBadge = (st: string) => {
    if (st === "PENDING") return <Badge variant="destructive" className="text-xs">未対応</Badge>;
    if (st === "RESOLVED") return <Badge variant="secondary" className="text-xs">対応済み</Badge>;
    return <Badge variant="outline" className="text-xs">却下</Badge>;
  };

  const tabs = [
    { key: "users", label: "ユーザー一覧", icon: null },
    { key: "posts", label: "投稿管理", icon: <FileQuestion className="h-4 w-4" /> },
    { key: "reports", label: "通報管理", icon: <Flag className="h-4 w-4" /> },
    { key: "banned", label: "禁止ワード設定", icon: null },
  ] as const;

  return (
    <div>
      <PageHeader title="一般ユーザー管理" />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Users Tab ─────────────────────────────────────────────────────── */}
      {tab === "users" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="名前・メールで検索..."
              className="max-w-xs" onKeyDown={e => e.key === "Enter" && fetchUsers()} />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="normal">正常</SelectItem>
                <SelectItem value="frozen">凍結</SelectItem>
                <SelectItem value="deleted">退会済み</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">登録日</SelectItem>
                <SelectItem value="lastLoginAt">最終ログイン</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={fetchUsers}>検索</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前 / ニックネーム</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>回答 / いいね</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead>最終ログイン</TableHead>
                  <TableHead className="w-36">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">読み込み中...</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">ユーザーが見つかりません</TableCell></TableRow>
                ) : users.map(u => (
                  <TableRow key={u.id} className={u.deletedAt ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {u.avatarUrl
                          ? <img src={u.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          : <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0"><User className="h-3.5 w-3.5 text-muted-foreground" /></div>
                        }
                        <div>
                          <p className="font-medium text-sm">{u.nickname || u.fullName}</p>
                          {u.nickname && <p className="text-xs text-muted-foreground">{u.fullName}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getStatusBadge(u)}
                        {!u.emailVerified && <Badge variant="outline" className="text-xs">未認証</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u._count.qaAnswers} / {u.totalLikesReceived}</TableCell>
                    <TableCell className="text-xs">{new Date(u.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell className="text-xs">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("ja-JP") : "-"}</TableCell>
                    <TableCell>
                      {!u.deletedAt && (
                        <div className="flex gap-1">
                          <button title="編集" onClick={() => openEdit(u)} className="p-1 hover:text-primary">
                            <Pencil className="h-4 w-4" />
                          </button>
                          {u.frozen
                            ? <button title="凍結解除" onClick={() => patch(u.id, { frozen: false }, "凍結解除しました")} className="p-1 hover:text-green-600"><Unlock className="h-4 w-4" /></button>
                            : <button title="凍結" onClick={() => patch(u.id, { frozen: true }, "凍結しました")} className="p-1 hover:text-amber-600"><Lock className="h-4 w-4" /></button>
                          }
                          <button title="パスワードリセットメール送信" onClick={() => patch(u.id, { action: "reset_password" }, "リセットメールを送信しました")} className="p-1 hover:text-primary">
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button title="投稿管理" onClick={() => { setPostsUserId(u.id); setTab("posts"); fetchUserPosts(u.id); }} className="p-1 hover:text-primary">
                            <FileQuestion className="h-4 w-4" />
                          </button>
                          <button title="強制退会" onClick={() => setDeleteId(u.id)} className="p-1 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* ── Posts Tab ──────────────────────────────────────────────────────── */}
      {tab === "posts" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-sm">ユーザーを選択</Label>
              <Select value={postsUserId} onValueChange={id => { setPostsUserId(id); fetchUserPosts(id); }}>
                <SelectTrigger className="w-64"><SelectValue placeholder="ユーザーを選択..." /></SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nickname || u.fullName} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!users.length && (
              <Button variant="secondary" size="sm" onClick={fetchUsers}>ユーザーを読み込む</Button>
            )}
          </div>

          {postsLoading && (
            <p className="text-sm text-muted-foreground py-4">読み込み中...</p>
          )}

          {userPosts && !postsLoading && (
            <>
              {/* Questions */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <FileQuestion className="h-4 w-4" /> 質問 ({userPosts.questions.length}件)
                </h3>
                {userPosts.questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">質問はありません</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>タイトル</TableHead>
                          <TableHead>状態</TableHead>
                          <TableHead>投稿日</TableHead>
                          <TableHead className="w-16">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userPosts.questions.map(q => (
                          <TableRow key={q.id}>
                            <TableCell className="text-sm max-w-xs">
                              <a href={`/qa/${q.slug}`} target="_blank" className="hover:underline line-clamp-1">{q.title}</a>
                            </TableCell>
                            <TableCell>
                              {q.hidden && <Badge variant="outline" className="text-xs">非表示</Badge>}
                            </TableCell>
                            <TableCell className="text-xs">{new Date(q.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                            <TableCell>
                              <button onClick={() => deletePost(q.id, "question")} className="p-1 hover:text-destructive" title="削除">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Answers */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <FileQuestion className="h-4 w-4" /> 回答 ({userPosts.answers.length}件)
                </h3>
                {userPosts.answers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">回答はありません</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>回答内容</TableHead>
                          <TableHead>質問</TableHead>
                          <TableHead>状態</TableHead>
                          <TableHead>投稿日</TableHead>
                          <TableHead className="w-16">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userPosts.answers.map(a => (
                          <TableRow key={a.id}>
                            <TableCell className="text-sm max-w-xs">
                              <p className="line-clamp-2">{a.content}</p>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[150px]">
                              <a href={`/qa/${a.question.slug}`} target="_blank" className="hover:underline line-clamp-1">{a.question.title}</a>
                            </TableCell>
                            <TableCell>
                              {a.hidden && <Badge variant="outline" className="text-xs">非表示</Badge>}
                            </TableCell>
                            <TableCell className="text-xs">{new Date(a.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                            <TableCell>
                              <button onClick={() => deletePost(a.id, "answer")} className="p-1 hover:text-destructive" title="削除">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}

          {!userPosts && !postsLoading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              ユーザーを選択して投稿を確認してください
            </div>
          )}
        </div>
      )}

      {/* ── Reports Tab ────────────────────────────────────────────────────── */}
      {tab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={reportStatus} onValueChange={v => { setReportStatus(v); fetchReports(v); }}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="PENDING">未対応</SelectItem>
                <SelectItem value="RESOLVED">対応済み</SelectItem>
                <SelectItem value="DISMISSED">却下</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" onClick={() => fetchReports()}>更新</Button>
          </div>

          {reportsLoading ? (
            <p className="text-sm text-muted-foreground py-4">読み込み中...</p>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">通報はありません</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>通報理由</TableHead>
                    <TableHead>対象投稿</TableHead>
                    <TableHead>通報者</TableHead>
                    <TableHead>日時</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="w-48">対応アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm max-w-[180px]">
                        <p className="line-clamp-2">{r.reason}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                        {r.question
                          ? <a href={`/qa/${r.question.slug}`} target="_blank" className="hover:underline line-clamp-2">{r.question.title}</a>
                          : r.answer
                            ? <span className="line-clamp-2">回答: {r.answer.content.slice(0, 60)}...</span>
                            : "-"
                        }
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.reporter?.nickname || r.reporter?.email || "不明"}
                      </TableCell>
                      <TableCell className="text-xs">{new Date(r.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>{getReportStatusBadge(r.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {r.status === "PENDING" && (
                            <>
                              <button onClick={() => resolveReport(r.id, "RESOLVED")}
                                className="p-1 hover:text-green-600" title="対応済みにする">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button onClick={() => resolveReport(r.id, "DISMISSED")}
                                className="p-1 hover:text-muted-foreground" title="却下">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {(r.question || r.answer) && (
                            <button onClick={() => deleteReportedPost(r)}
                              className="p-1 hover:text-destructive" title="投稿を削除">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ── Banned Words Tab ───────────────────────────────────────────────── */}
      {tab === "banned" && (
        <div className="max-w-md space-y-4">
          <p className="text-sm text-muted-foreground">ニックネームに使用できない禁止ワードを管理します。</p>
          <div className="flex gap-2">
            <Input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="禁止ワードを追加..."
              onKeyDown={e => { if (e.key === "Enter" && newWord.trim()) { saveBanned([...bannedWords, newWord.trim()]); setNewWord(""); } }} />
            <Button onClick={() => { if (newWord.trim()) { saveBanned([...bannedWords, newWord.trim()]); setNewWord(""); } }}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="space-y-1">
            {bannedWords.map((w, i) => (
              <li key={i} className="flex items-center justify-between px-3 py-1.5 bg-muted rounded text-sm">
                <span>{w}</span>
                <button onClick={() => saveBanned(bannedWords.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={v => !v && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>フルネーム</Label>
                <Input value={editFullName} onChange={e => setEditFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>ニックネーム</Label>
                <Input value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="（未設定）" />
              </div>
              <div className="space-y-1.5">
                <Label>メールアドレス</Label>
                <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              {editUser.avatarUrl && (
                <div className="space-y-1.5">
                  <Label>アバター画像</Label>
                  <div className="flex items-center gap-3">
                    <img src={editUser.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border" />
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => { handleDeleteAvatar(editUser); setEditUser({ ...editUser, avatarUrl: null }); }}>
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      アバターを削除
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>キャンセル</Button>
            <Button onClick={handleSaveEdit} disabled={editSaving}>{editSaving ? "保存中..." : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>強制退会</AlertDialogTitle>
            <AlertDialogDescription>
              このユーザーを強制退会させますか？投稿データは「退会済みユーザー」として匿名で残ります。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              強制退会する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
