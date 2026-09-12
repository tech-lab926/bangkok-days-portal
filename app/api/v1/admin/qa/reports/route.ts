// Admin Q&A reports management
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("qa", "canView");
    const status = req.nextUrl.searchParams.get("status") || undefined;

    const reports = await prisma.qaReport.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        reporter: { select: { id: true, nickname: true, email: true } },
        question: { select: { id: true, slug: true, title: true } },
        answer: { select: { id: true, content: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return success(reports);
  } catch (err) {
    return error(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("qa", "canEdit");
    const { id, status } = await req.json();
    await prisma.qaReport.update({ where: { id }, data: { status } });
    return success({ updated: true });
  } catch (err) {
    return error(err);
  }
}
