// POST /api/v1/admin/qa/auto-best — auto-promote top-liked answer to best if no best selected after N days
// Call this via a cron job (e.g. daily)
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  // Simple secret check to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return error({ message: "Unauthorized", statusCode: 401 });
  }

  try {
    const settings = await prisma.globalSettings.findMany({
      where: { key: { in: ["qa_best_auto_enabled", "qa_best_auto_days"] } },
    });
    const s: Record<string, string> = {};
    for (const r of settings) s[r.key] = r.value;

    if (s.qa_best_auto_enabled === "false") return success({ promoted: 0 });

    const days = parseInt(s.qa_best_auto_days || "30");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Find questions older than threshold, not closed, with no best answer
    const questions = await prisma.qaQuestion.findMany({
      where: {
        createdAt: { lte: cutoff },
        closed: false,
        hidden: false,
        answers: { none: { isBest: true } },
      },
      include: {
        answers: {
          where: { hidden: false, parentId: null },
          orderBy: { likeCount: "desc" },
          take: 1,
        },
      },
    });

    let promoted = 0;
    for (const q of questions) {
      if (q.answers[0]) {
        await prisma.qaAnswer.update({ where: { id: q.answers[0].id }, data: { isBest: true } });
        promoted++;
      }
    }

    return success({ promoted });
  } catch (err) {
    return error(err);
  }
}
