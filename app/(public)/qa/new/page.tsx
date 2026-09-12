"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { MessageCircle, AlertCircle } from "lucide-react";

interface Suggestion { slug: string; title: string; _count: { answers: number } }

export default function NewQaPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (title.length < 5) { setSuggestions([]); return; }
    clearTimeout(suggestTimer.current!);
    suggestTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/v1/qa/suggest?q=${encodeURIComponent(title)}`);
      const json = await res.json();
      setSuggestions(json.data || []);
    }, 500);
  }, [title]);

  if (status === "loading") return null;
  if (!session || session.user.userType !== "user") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="mb-4">質問するにはログインが必要です</p>
        <Link href="/auth/login"><Button>ログイン</Button></Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("タイトルを入力してください"); return; }
    if (!content.trim()) { toast.error("内容を入力してください"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("質問を投稿しました");
      router.push(`/qa/${json.data.slug}`);
    } catch (err: any) {
      toast.error(err.message || "投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">質問する</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">タイトル <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="質問のタイトルを入力..."
            maxLength={200}
          />
        </div>

        {suggestions.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              似た質問が見つかりました。先にご確認ください。
            </p>
            <ul className="space-y-1">
              {suggestions.map(s => (
                <li key={s.slug}>
                  <Link href={`/qa/${s.slug}`} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 shrink-0" />
                    {s.title}
                    <span className="text-muted-foreground ml-1">({s._count.answers}件の回答)</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="content">内容 <span className="text-destructive">*</span></Label>
          <Textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="詳細を入力してください..."
            rows={8}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "投稿中..." : "質問を投稿する"}
        </Button>
      </form>
    </section>
  );
}
