"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, MessageCircle, ChevronRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  author: { nickname: string | null; fullName: string };
  _count: { answers: number };
}

export default function QaListPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) qs.set("q", search);
    const res = await fetch(`/api/v1/qa?${qs}`);
    const json = await res.json();
    setQuestions(json.data?.questions || []);
    setTotal(json.data?.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(q);
  };

  const isLoggedIn = session?.user?.userType === "user";

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Q&amp;A</h1>
        {isLoggedIn ? (
          <Link href="/qa/new">
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />質問する</Button>
          </Link>
        ) : (
          <Link href="/auth/login">
            <Button size="sm" variant="outline">ログインして質問する</Button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="質問を検索..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">検索</Button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageCircle className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p>{search ? "該当する質問が見つかりません" : "まだ質問がありません"}</p>
        </div>
      ) : (
        <ul className="divide-y border rounded-lg overflow-hidden">
          {questions.map(q => (
            <li key={q.id}>
              <Link href={`/qa/${q.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{q.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {q.author.nickname || q.author.fullName} · {new Date(q.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />{q._count.answers}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>前へ</Button>
          <span className="text-sm self-center">{page} / {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>次へ</Button>
        </div>
      )}
    </section>
  );
}
