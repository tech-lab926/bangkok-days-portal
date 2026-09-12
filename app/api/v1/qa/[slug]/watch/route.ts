// POST /api/v1/qa/[slug]/watch — toggle watch
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requireVerifiedUser } from "@/lib/user-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireVerifiedUser();
    const { slug } = await params;

    const question = await prisma.qaQuestion.findUnique({ where: { slug } });
    if (!question) return error({ message: "質問が見つかりません", statusCode: 404 });

    const existing = await prisma.qaWatch.findUnique({
      where: { questionId_userId: { questionId: question.id, userId: session.user.id } },
    });

    if (existing) {
      await prisma.qaWatch.delete({ where: { id: existing.id } });
      return success({ watching: false });
    } else {
      await prisma.qaWatch.create({ data: { questionId: question.id, userId: session.user.id } });
      return success({ watching: true });
    }
  } catch (err) {
    return error(err);
  }
}
