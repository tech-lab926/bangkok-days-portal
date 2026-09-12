// GET  — get own profile
// PATCH — update nickname/avatar/bio/password
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requireVerifiedUser } from "@/lib/user-auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getBadgeConfig, computeBadges } from "@/lib/badges";

export async function GET(req: NextRequest) {
  try {
    const session = await requireVerifiedUser();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, email: true, fullName: true, nickname: true, avatarUrl: true, bio: true,
        totalLikesReceived: true, createdAt: true,
        _count: { select: { qaAnswers: true, qaQuestions: true } },
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

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireVerifiedUser();
    const { nickname, avatarUrl, bio, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return error({ message: "ユーザーが見つかりません", statusCode: 404 });

    const data: any = {};

    if (nickname !== undefined) {
      if (nickname.length > 30) return error({ message: "ニックネームは30文字以内です", statusCode: 400 });
      // Banned words check
      const bannedRow = await prisma.globalSettings.findUnique({ where: { key: "banned_words" } });
      if (bannedRow?.value) {
        const banned = bannedRow.value.split(",").map((w: string) => w.trim().toLowerCase()).filter(Boolean);
        if (banned.some((w: string) => nickname.toLowerCase().includes(w))) {
          return error({ message: "使用できないニックネームです", statusCode: 400 });
        }
      }
      data.nickname = nickname;
    }
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (bio !== undefined) {
      if (bio.length > 140) return error({ message: "自己紹介は140文字以内です", statusCode: 400 });
      data.bio = bio;
    }

    if (currentPassword && newPassword) {
      const valid = await verifyPassword(currentPassword, user.password);
      if (!valid) return error({ message: "現在のパスワードが正しくありません", statusCode: 400 });
      if (newPassword.length < 8) return error({ message: "パスワードは8文字以上です", statusCode: 400 });
      data.password = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, nickname: true, avatarUrl: true, bio: true },
    });

    return success(updated);
  } catch (err) {
    return error(err);
  }
}

export async function DELETE() {
  try {
    const session = await requireVerifiedUser();
    // Soft-delete: set deletedAt and clear PII so posts appear as "退会済みユーザー"
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        deletedAt: new Date(),
        email: `deleted_${session.user.id}@deleted.invalid`,
        fullName: "退会済みユーザー",
        nickname: null,
        avatarUrl: null,
        bio: null,
        password: "",
      },
    });
    return success({ message: "アカウントを削除しました" });
  } catch (err) {
    return error(err);
  }
}

