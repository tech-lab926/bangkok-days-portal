// POST /api/v1/qa/[slug]/answers/[answerId]/like — toggle like
// POST /api/v1/qa/[slug]/answers/[answerId]/best — set best answer (question author only)
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requireVerifiedUser } from "@/lib/user-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; answerId: string }> }
) {
  try {
    const session = await requireVerifiedUser();
    const { slug, answerId } = await params;
    const { action } = await req.json(); // "like" | "best"

    const question = await prisma.qaQuestion.findUnique({ where: { slug } });
    if (!question) return error({ message: "質問が見つかりません", statusCode: 404 });

    if (action === "like") {
      const existing = await prisma.qaLike.findUnique({
        where: { answerId_userId: { answerId, userId: session.user.id } },
      });

      if (existing) {
        await prisma.qaLike.delete({ where: { id: existing.id } });
        await prisma.qaAnswer.update({ where: { id: answerId }, data: { likeCount: { decrement: 1 } } });
        // decrement author total likes
        const ans = await prisma.qaAnswer.findUnique({ where: { id: answerId }, select: { authorId: true } });
        if (ans?.authorId) {
          await prisma.user.update({ where: { id: ans.authorId }, data: { totalLikesReceived: { decrement: 1 } } });
        }
        return success({ liked: false });
      } else {
        await prisma.qaLike.create({ data: { answerId, userId: session.user.id } });
        await prisma.qaAnswer.update({ where: { id: answerId }, data: { likeCount: { increment: 1 } } });
        const ans = await prisma.qaAnswer.findUnique({ where: { id: answerId }, select: { authorId: true } });
        if (ans?.authorId) {
          await prisma.user.update({ where: { id: ans.authorId }, data: { totalLikesReceived: { increment: 1 } } });
        }
        return success({ liked: true });
      }
    }

    if (action === "best") {
      if (question.authorId !== session.user.id) return error({ message: "質問者のみ選択できます", statusCode: 403 });
      // Unset previous best in this question
      await prisma.qaAnswer.updateMany({ where: { questionId: question.id, isBest: true }, data: { isBest: false } });
      await prisma.qaAnswer.update({ where: { id: answerId }, data: { isBest: true } });
      return success({ best: true });
    }

    return error({ message: "不正なアクション", statusCode: 400 });
  } catch (err) {
    return error(err);
  }
}
