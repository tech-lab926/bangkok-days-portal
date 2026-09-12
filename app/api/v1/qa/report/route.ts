// POST /api/v1/qa/report — report a question or answer
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requireVerifiedUser } from "@/lib/user-auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await requireVerifiedUser();
    const { questionId, answerId, reason } = await req.json();

    if (!reason?.trim()) return error({ message: "理由を入力してください", statusCode: 400 });
    if (!questionId && !answerId) return error({ message: "対象を指定してください", statusCode: 400 });

    await prisma.qaReport.create({
      data: { questionId: questionId || null, answerId: answerId || null, reason: reason.trim(), reporterId: session.user.id },
    });

    // Check threshold
    const settings = await prisma.globalSettings.findMany({
      where: { key: { in: ["qa_spam_threshold", "qa_spam_notify_email", "qa_spam_notify"] } },
    });
    const s: Record<string, string> = {};
    for (const r of settings) s[r.key] = r.value;

    const threshold = parseInt(s.qa_spam_threshold || "5");
    const notifyEnabled = s.qa_spam_notify !== "false";
    const notifyEmail = s.qa_spam_notify_email;

    if (notifyEnabled && notifyEmail) {
      const count = await prisma.qaReport.count({
        where: {
          ...(questionId ? { questionId } : {}),
          ...(answerId ? { answerId } : {}),
          status: "PENDING",
        },
      });
      if (count >= threshold) {
        sendEmail({
          to: notifyEmail,
          subject: "【バンコクデイズ】スパム通報が閾値を超えました",
          text: `通報数が${count}件に達しました。\n対象: ${questionId ? `質問ID: ${questionId}` : `回答ID: ${answerId}`}\n\n管理画面で確認してください。`,
        }).catch(() => {});
      }
    }

    return success({ reported: true });
  } catch (err) {
    return error(err);
  }
}
