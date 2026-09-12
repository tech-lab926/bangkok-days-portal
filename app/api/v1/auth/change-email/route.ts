// POST — request email change (sends verification to new address)
// PUT  — confirm email change with token
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { success, error } from "@/lib/api-response";
import { requireVerifiedUser } from "@/lib/user-auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await requireVerifiedUser();
    const { newEmail, password } = await req.json();

    if (!newEmail || !password) return error({ message: "必須項目が不足しています", statusCode: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return error({ message: "ユーザーが見つかりません", statusCode: 404 });

    const valid = await verifyPassword(password, user.password);
    if (!valid) return error({ message: "パスワードが正しくありません", statusCode: 400 });

    const normalized = newEmail.trim().toLowerCase();
    const taken = await prisma.user.findUnique({ where: { email: normalized } });
    if (taken) return error({ message: "このメールアドレスは既に使用されています", statusCode: 409 });

    const token = `emailchange:${normalized}:${randomUUID()}`;
    const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: token, tokenExpiresAt } });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    await sendEmail({
      to: normalized,
      subject: "【バンコクデイズ】メールアドレス変更の確認",
      text: `以下のリンクをクリックしてメールアドレスの変更を完了してください。\n有効期限: 60分\n\n${baseUrl}/auth/confirm-email?token=${encodeURIComponent(token)}`,
    });

    return success({ sent: true });
  } catch (err) {
    return error(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token?.startsWith("emailchange:")) return error({ message: "無効なトークンです", statusCode: 400 });

    const parts = token.split(":");
    const newEmail = parts[1];

    const user = await prisma.user.findFirst({
      where: { verificationToken: token, tokenExpiresAt: { gt: new Date() } },
    });
    if (!user) return error({ message: "リンクが無効または期限切れです", statusCode: 400 });

    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail, verificationToken: null, tokenExpiresAt: null },
    });

    return success({ updated: true });
  } catch (err) {
    return error(err);
  }
}
