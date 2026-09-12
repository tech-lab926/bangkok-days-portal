import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return error({ message: "メールアドレスを入力してください", statusCode: 400 });

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, fullName: true, email: true, active: true, deletedAt: true },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.active || user.deletedAt) return success({ sent: true });

    // Rate limit: 1 request per 5 min — reuse verificationToken field with short expiry check
    const existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: { tokenExpiresAt: true, verificationToken: true },
    });
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (existing?.tokenExpiresAt && existing.tokenExpiresAt > fiveMinAgo && existing.verificationToken?.startsWith("reset:")) {
      return success({ sent: true }); // silently rate-limit
    }

    const token = `reset:${randomUUID()}`;
    const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 min

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, tokenExpiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    await sendEmail({
      to: user.email,
      subject: "【バンコクデイズ】パスワードリセット",
      text: `${user.fullName} 様\n\n以下のリンクからパスワードをリセットしてください。\nリンクの有効期限は60分です。\n\n${resetUrl}\n\nこのメールに心当たりがない場合は無視してください。`,
    });

    return success({ sent: true });
  } catch (err) {
    return error(err);
  }
}
