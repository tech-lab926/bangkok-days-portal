import prisma from "@/lib/prisma";

export interface BadgeConfig {
  id: string;
  label: string;
  answerCount: number;
  likeCount: number;
}

const DEFAULT_BADGES: BadgeConfig[] = [
  { id: "answer_1", label: "初回回答者", answerCount: 1, likeCount: 0 },
  { id: "answer_10", label: "回答者", answerCount: 10, likeCount: 0 },
  { id: "answer_50", label: "エキスパート", answerCount: 50, likeCount: 0 },
  { id: "like_10", label: "人気回答者", answerCount: 0, likeCount: 10 },
  { id: "like_50", label: "トップ回答者", answerCount: 0, likeCount: 50 },
];

export async function getBadgeConfig(): Promise<BadgeConfig[]> {
  const row = await prisma.globalSettings.findUnique({
    where: { key: "qa_badges" },
  });
  if (row?.value) {
    try {
      return JSON.parse(row.value);
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_BADGES;
}

export function computeBadges(
  badges: BadgeConfig[],
  answerCount: number,
  totalLikes: number,
) {
  return badges.filter(
    (b) =>
      answerCount >= b.answerCount &&
      totalLikes >= b.likeCount &&
      (b.answerCount > 0 || b.likeCount > 0),
  );
}
