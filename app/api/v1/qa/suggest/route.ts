// GET /api/v1/qa/suggest?q=... - similar question suggestions
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    if (q.length < 3) return success([]);

    const settings = await prisma.globalSettings.findMany({
      where: { key: { in: ["qa_suggest_enabled", "qa_suggest_limit"] } },
    });
    const s: Record<string, string> = {};
    for (const r of settings) s[r.key] = r.value;
    if (s.qa_suggest_enabled === "false") return success([]);
    const limit = Math.min(10, parseInt(s.qa_suggest_limit || "5"));

    const suggestions = await prisma.qaQuestion.findMany({
      where: { hidden: false, title: { contains: q, mode: "insensitive" } },
      select: { slug: true, title: true, _count: { select: { answers: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return success(suggestions);
  } catch (err) {
    return error(err);
  }
}
