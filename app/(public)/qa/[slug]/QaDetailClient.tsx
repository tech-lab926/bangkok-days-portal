"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Bell, BellOff, Crown, Flag, AlertTriangle, MessageCircle, RotateCcw } from "lucide-react";

interface Author { id: string; nickname: string | null; fullName: string; avatarUrl: string | null; totalLikesReceived: number }
interface Answer {
  id: string; content: string; isBest: boolean; isOld: boolean; liked: boolean; likeCount: number;
  createdAt: string; author: Author | null; replies: Answer[];
}
interface Question {
  id: string; slug: string; title: string; content: string; createdAt: string; viewCount: number;
  author: Author | null; answers: Answer[]; watched: boolean; closed: boolean;
}

function AnswerBlock({
  answer, questionSlug, questionAuthorId, userId, onRefresh, depth = 0
}: {
  answer: Answer; questionSlug: string; questionAuthorId: string | null;
  userId: string | null; onRefresh: () => void; depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleLike = async () => {
    if (!userId) { toast.error("ログインが必要です"); return; }
    await fetch(`/api/v1/qa/${questionSlug}/answers/${answer.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like" }),
    });
    onRefresh();
  };

  const handleBest = async () => {
    await fetch(`/api/v1/qa/${questionSlug}/answers/${answer.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "best" }),
    });
    onRefresh();
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    const res = await fetch(`/api/v1/qa/${questionSlug}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText, parentId: answer.id }),
    });
    const json = await res.json();
    if (!json.success) { toast.error(json.error); return; }
    setReplyText(""); setReplying(false); onRefresh();
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    const res = await fetch("/api/v1/qa/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId: answer.id, reason: reportReason }),
    });
    const json = await res.json();
    if (json.success) { toast.success("通報しました"); setReporting(false); }
    else toast.error(json.error);
  };

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-muted pl-4" : "border rounded-lg p-4"} ${answer.isBest ? "border-green-400 bg-green-50/50" : ""}`}>
      {answer.isBest && (
        <div className="flex items-center gap-1 text-green-700 text-xs font-semibold mb-2">
          <Crown className="h-3.5 w-3.5" /> ベストアンサー
        </div>
      )}
      {answer.isOld && (
        <div className="flex items-center gap-1 text-amber-600 text-xs mb-2">
          <AlertTriangle className="h-3.5 w-3.5" /> この回答は古い情報の可能性があります
        </div>
      )}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 text-sm whitespace-pre-wrap">{answer.content}</div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span>{answer.author?.nickname || answer.author?.fullName || "退会済みユーザー"}</span>
        <span>· {new Date(answer.createdAt).toLocaleDateString("ja-JP")}</span>
        <span className="flex items-center gap-0.5">
          <ThumbsUp className="h-3 w-3" /> {answer.author?.totalLikesReceived ?? 0}いいね累計
        </span>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <button onClick={handleLike} className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${answer.liked ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>
          <ThumbsUp className="h-3 w-3" /> {answer.likeCount}
        </button>
        {userId && depth === 0 && (
          <button onClick={() => setReplying(!replying)} className="text-xs px-2 py-1 rounded border hover:bg-muted flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> 返信
          </button>
        )}
        {userId === questionAuthorId && depth === 0 && !answer.isBest && (
          <button onClick={handleBest} className="text-xs px-2 py-1 rounded border border-green-400 text-green-700 hover:bg-green-50 flex items-center gap-1">
            <Crown className="h-3 w-3" /> ベストアンサーに設定
          </button>
        )}
        {userId && (
          <button onClick={() => setReporting(!reporting)} className="text-xs px-2 py-1 rounded border hover:bg-muted flex items-center gap-1 text-muted-foreground">
            <Flag className="h-3 w-3" /> 通報
          </button>
        )}
      </div>
      {replying && (
        <div className="mt-3 space-y-2">
          <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="返信を入力..." className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReply} disabled={!replyText.trim()}>送信</Button>
            <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>キャンセル</Button>
          </div>
        </div>
      )}
      {reporting && (
        <div className="mt-3 space-y-2">
          <Textarea value={reportReason} onChange={e => setReportReason(e.target.value)} rows={2} placeholder="通報理由を入力..." className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleReport} disabled={!reportReason.trim()}>通報する</Button>
            <Button size="sm" variant="ghost" onClick={() => setReporting(false)}>キャンセル</Button>
          </div>
        </div>
      )}
      {answer.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {answer.replies.map(r => (
            <AnswerBlock key={r.id} answer={r} questionSlug={questionSlug} questionAuthorId={questionAuthorId} userId={userId} onRefresh={onRefresh} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function QaDetailClient({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportingQ, setReportingQ] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const userId = session?.user?.userType === "user" ? session.user.id : null;

  const load = async () => {
    const res = await fetch(`/api/v1/qa/${slug}`);
    const json = await res.json();
    if (json.success) setQuestion(json.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const handleWatch = async () => {
    const res = await fetch(`/api/v1/qa/${slug}/watch`, { method: "POST" });
    const json = await res.json();
    if (json.success) setQuestion(q => q ? { ...q, watched: json.data.watching } : q);
  };

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/v1/qa/${slug}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: answerText }),
    });
    const json = await res.json();
    if (!json.success) { toast.error(json.error); setSubmitting(false); return; }
    setAnswerText(""); toast.success("回答を投稿しました"); load();
    setSubmitting(false);
  };

  const handleReportQ = async () => {
    if (!reportReason.trim()) return;
    const res = await fetch("/api/v1/qa/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question?.id, reason: reportReason }),
    });
    const json = await res.json();
    if (json.success) { toast.success("通報しました"); setReportingQ(false); }
    else toast.error(json.error);
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4"><div className="h-8 bg-muted rounded" /><div className="h-32 bg-muted rounded" /></div>;
  if (!question) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">質問が見つかりません。</div>;

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <nav className="text-xs text-muted-foreground mb-3">
          <Link href="/qa" className="hover:underline">Q&amp;A</Link> / 質問
        </nav>
        <h1 className="text-xl font-bold leading-snug">{question.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
          <span>{question.author?.nickname || question.author?.fullName || "退会済みユーザー"}</span>
          <span>· {new Date(question.createdAt).toLocaleDateString("ja-JP")}</span>
          <span>· 閲覧 {question.viewCount}</span>
          {userId && (
            <button onClick={handleWatch} className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto">
              {question.watched ? <><BellOff className="h-3.5 w-3.5" />ウォッチ解除</> : <><Bell className="h-3.5 w-3.5" />ウォッチ</>}
            </button>
          )}
          {userId && (
            <button onClick={() => setReportingQ(!reportingQ)} className="flex items-center gap-1 hover:text-foreground">
              <Flag className="h-3.5 w-3.5" />通報
            </button>
          )}
        </div>
        {reportingQ && (
          <div className="mt-3 space-y-2">
            <Textarea value={reportReason} onChange={e => setReportReason(e.target.value)} rows={2} placeholder="通報理由..." className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleReportQ} disabled={!reportReason.trim()}>通報する</Button>
              <Button size="sm" variant="ghost" onClick={() => setReportingQ(false)}>キャンセル</Button>
            </div>
          </div>
        )}
        <div className="mt-4 text-sm whitespace-pre-wrap text-foreground leading-relaxed border rounded-lg p-4 bg-muted/20">
          {question.content}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          回答 <Badge variant="secondary">{question.answers.length}</Badge>
        </h2>
        {question.answers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">まだ回答がありません。最初に回答してみましょう！</p>
        ) : (
          <div className="space-y-4">
            {question.answers.map(a => (
              <AnswerBlock
                key={a.id}
                answer={a}
                questionSlug={slug}
                questionAuthorId={question.author?.id || null}
                userId={userId}
                onRefresh={load}
              />
            ))}
          </div>
        )}
      </div>

      {!question.closed && (
        <div>
          <h2 className="text-lg font-semibold mb-3">回答する</h2>
          {userId ? (
            <form onSubmit={handleAnswer} className="space-y-3">
              <Textarea
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                rows={6}
                placeholder="回答を入力してください..."
              />
              <Button type="submit" disabled={submitting || !answerText.trim()}>
                {submitting ? "送信中..." : "回答を投稿する"}
              </Button>
            </form>
          ) : (
            <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
              回答するには<Link href="/auth/login" className="text-primary hover:underline mx-1">ログイン</Link>してください
            </div>
          )}
        </div>
      )}
      {question.closed && (
        <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground bg-muted/20">
          この質問はクローズされています
        </div>
      )}
    </section>
  );
}
