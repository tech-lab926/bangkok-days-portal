import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { getUserSession } from "@/lib/user-auth";

const authorSelect = {
  select: { id: true, nickname: true, fullName: true, avatarUrl: true, totalLikesReceived: true },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getUserSession();
    const userId = session?.user?.userType === "user" ? session.user.id : null;

    const question = await prisma.qaQuestion.findUnique({
      where: { slug, hidden: false },
      include: {
        author: authorSelect,
        answers: {
          where: { hidden: false, parentId: null },
          include: {
            author: authorSelect,
            replies: {
              where: { hidden: false },
              include: { author: authorSelect },
              orderBy: { createdAt: "asc" },
            },
            likes: userId ? { where: { userId } } : false,
          },
          orderBy: [{ isBest: "desc" }, { likeCount: "desc" }, { createdAt: "asc" }],
        },
        watches: userId ? { where: { userId } } : false,
        _count: { select: { answers: { where: { hidden: false } } } },
      },
    });

    if (!question) return error({ message: "質問が見つかりません", statusCode: 404 });

    // Increment view count (fire and forget)
    prisma.qaQuestion.update({ where: { id: question.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    // Check old flag threshold
    const settings = await prisma.globalSettings.findMany({
      where: { key: { in: ["qa_old_flag_months", "qa_old_flag_enabled"] } },
    });
    const s: Record<string, string> = {};
    for (const r of settings) s[r.key] = r.value;
    const oldMonths = parseInt(s.qa_old_flag_months || "12");
    const oldFlagEnabled = s.qa_old_flag_enabled !== "false";
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - oldMonths);

    const answersWithFlags = question.answers.map((a) => ({
      ...a,
      isOld: oldFlagEnabled && new Date(a.createdAt) < cutoff,
      liked: userId ? (a.likes as any[]).length > 0 : false,
      likes: undefined,
    }));

    return success({
      ...question,
      answers: answersWithFlags,
      watched: userId ? (question.watches as any[]).length > 0 : false,
      watches: undefined,
    });
  } catch (err) {
    return error(err);
  }
}
