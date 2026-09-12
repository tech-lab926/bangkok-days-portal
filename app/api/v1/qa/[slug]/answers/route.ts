import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requireVerifiedUser } from "@/lib/user-auth";
import { sendEmail } from "@/lib/email";

const authorSelect = {
  select: { id: true, nickname: true, fullName: true, avatarUrl: true, totalLikesReceived: true },
};

const notifyKeys = ["qa_answer_notify", "qa_watch_notify"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireVerifiedUser();
    const { slug } = await params;
    const { content, parentId } = await req.json();

    if (!content?.trim()) return error({ message: "内容は必須です", statusCode: 400 });

    const question = await prisma.qaQuestion.findUnique({
      where: { slug, hidden: false, closed: false },
    });
    if (!question) return error({ message: "質問が見つかりません", statusCode: 404 });

    const answer = await prisma.qaAnswer.create({
      data: {
        questionId: question.id,
        content: content.trim(),
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: { author: authorSelect },
    });

    const [questionAuthor, watches, settingsRows] = await Promise.all([
      question.authorId
        ? prisma.user.findUnique({ where: { id: question.authorId }, select: { email: true, nickname: true, fullName: true } })
        : null,
      prisma.qaWatch.findMany({
        where: { questionId: question.id },
        include: { user: { select: { email: true } } },
      }),
      prisma.globalSettings.findMany({ where: { key: { in: notifyKeys } } }),
    ]);

    const s: Record<string, string> = {};
    for (const r of settingsRows) s[r.key] = r.value;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/qa/${slug}`;
    const subject = `【バンコクデイズ】「${question.title}」に回答がつきました`;

    if (s.qa_answer_notify !== "false" && questionAuthor && question.authorId !== session.user.id) {
      sendEmail({
        to: questionAuthor.email,
        subject,
        text: `${questionAuthor.nickname || questionAuthor.fullName}さんの質問に回答がつきました。\n\n${url}`,
      }).catch(() => {});
    }

    if (s.qa_watch_notify !== "false") {
      for (const w of watches) {
        if (w.userId !== session.user.id) {
          sendEmail({
            to: w.user.email,
            subject,
            text: `ウォッチ中の質問に回答がつきました。\n\n${url}`,
          }).catch(() => {});
        }
      }
    }

    return success(answer);
  } catch (err) {
    return error(err);
  }
}
