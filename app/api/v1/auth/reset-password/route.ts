import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { success, error } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return error({ message: "無効なリクエストです", statusCode: 400 });
    if (password.length < 8) return error({ message: "パスワードは8文字以上で入力してください", statusCode: 400 });

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        tokenExpiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!user) return error({ message: "リンクが無効または期限切れです", statusCode: 400 });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(password),
        verificationToken: null,
        tokenExpiresAt: null,
        loginFailCount: 0,
        loginLockedUntil: null,
      },
    });

    return success({ reset: true });
  } catch (err) {
    return error(err);
  }
}
