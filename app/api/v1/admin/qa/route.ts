import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("qa", "canView");
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 30;
    const q = searchParams.get("q") || "";
    const hidden = searchParams.get("hidden");

    const where: any = {};
    if (q) where.title = { contains: q, mode: "insensitive" };
    if (hidden === "true") where.hidden = true;
    else if (hidden === "false") where.hidden = false;

    const [questions, total] = await Promise.all([
      prisma.qaQuestion.findMany({
        where,
        include: {
          author: { select: { id: true, nickname: true, email: true } },
          _count: { select: { answers: true, reports: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.qaQuestion.count({ where }),
    ]);

    return success({ questions, total, page, limit });
  } catch (err) {
    return error(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("qa", "canEdit");
    const { id, type, hidden, closed, isOldFlag } = await req.json();

    if (type === "question") {
      const data: any = {};
      if (hidden !== undefined) data.hidden = hidden;
      if (closed !== undefined) data.closed = closed;
      await prisma.qaQuestion.update({ where: { id }, data });
    } else if (type === "answer") {
      const data: any = {};
      if (hidden !== undefined) data.hidden = hidden;
      if (isOldFlag !== undefined) data.isOldFlag = isOldFlag;
      await prisma.qaAnswer.update({ where: { id }, data });
    }

    return success({ updated: true });
  } catch (err) {
    return error(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("qa", "canDelete");
    const { id, type } = await req.json();
    if (type === "question") await prisma.qaQuestion.delete({ where: { id } });
    else if (type === "answer") await prisma.qaAnswer.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return error(err);
  }
}
