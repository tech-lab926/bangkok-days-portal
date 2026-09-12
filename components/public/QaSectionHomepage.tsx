import Link from "next/link";
import prisma from "@/lib/prisma";
import { MessageCircle, ChevronRight } from "lucide-react";

async function getRecentQuestions() {
  try {
    const settings = await prisma.globalSettings.findUnique({ where: { key: "qa_enabled" } });
    if (settings?.value === "false") return null;

    return prisma.qaQuestion.findMany({
      where: { hidden: false },
      include: {
        author: { select: { nickname: true, fullName: true } },
        _count: { select: { answers: { where: { hidden: false } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch {
    return null;
  }
}

export default async function QaSectionHomepage() {
  const questions = await getRecentQuestions();
  if (!questions) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-[22px] font-extrabold tracking-[0.01em] text-[#004098] md:text-[28px]">
            <MessageCircle className="h-6 w-6 text-[#004098]" />
            Q&amp;A
          </h2>
          <Link
            href="/qa"
            className="flex items-center gap-1 text-sm font-medium text-[#0f4aa8] hover:underline"
          >
            もっと見る <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* List */}
        {questions.length === 0 ? (
          <div className="rounded-lg border border-[#d6dbe4] bg-[#f8f9fb] py-10 text-center">
            <p className="text-sm text-[#7a8190]">まだ質問がありません</p>
            <Link
              href="/qa/new"
              className="mt-2 inline-block text-sm text-[#0f4aa8] hover:underline"
            >
              最初に質問する
            </Link>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-[#d6dbe4] bg-white shadow-sm divide-y divide-[#e8eaef]">
            {questions.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/qa/${q.slug}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#f3f5f8]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold leading-snug text-[#1f2937] line-clamp-1">
                      {q.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#7a8190]">
                      {q.author?.nickname || q.author?.fullName} · {new Date(q.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[12px] text-[#7a8190]">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {q._count.answers}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#b0b8c4]" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Post link */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/qa/new"
            className="inline-flex items-center gap-2 rounded-full border border-[#004098] bg-white px-5 py-2.5 text-sm font-bold text-[#004098] transition hover:bg-[#004098] hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            質問を投稿する
          </Link>
        </div>
      </div>
    </section>
  );
}
