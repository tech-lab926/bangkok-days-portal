import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { getBadgeConfig, computeBadges } from "@/lib/badges";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id, active: true },
      select: {
        id: true, fullName: true, nickname: true, avatarUrl: true, bio: true,
        totalLikesReceived: true, createdAt: true,
        _count: { select: { qaAnswers: { where: { hidden: false } }, qaQuestions: { where: { hidden: false } } } },
        qaAnswers: {
          where: { hidden: false },
          select: { id: true, content: true, isBest: true, likeCount: true, createdAt: true, question: { select: { slug: true, title: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    if (!user) return error({ message: "ユーザーが見つかりません", statusCode: 404 });

    const badgeConfig = await getBadgeConfig();
    const badges = computeBadges(badgeConfig, user._count.qaAnswers, user.totalLikesReceived);

    return success({ ...user, badges });
  } catch (err) {
    return error(err);
  }
}
