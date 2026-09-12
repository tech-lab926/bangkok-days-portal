import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requireVerifiedUser, getUserSession } from "@/lib/user-auth";

const authorSelect = {
  select: { id: true, nickname: true, fullName: true, avatarUrl: true, totalLikesReceived: true },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const q = searchParams.get("q") || "";

    const where: any = { hidden: false };
    if (q) where.title = { contains: q, mode: "insensitive" };

    const [questions, total] = await Promise.all([
      prisma.qaQuestion.findMany({
        where,
        include: {
          author: authorSelect,
          _count: { select: { answers: { where: { hidden: false } } } },
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

export async function POST(req: NextRequest) {
  try {
    const session = await requireVerifiedUser();
    const { title, content } = await req.json();

    if (!title?.trim()) return error({ message: "タイトルは必須です", statusCode: 400 });
    if (!content?.trim()) return error({ message: "内容は必須です", statusCode: 400 });

    // Similar question suggestion check (return suggestions instead of blocking)
    const slug = `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const question = await prisma.qaQuestion.create({
      data: {
        slug,
        title: title.trim(),
        content: content.trim(),
        authorId: session.user.id,
      },
      include: { author: authorSelect, _count: { select: { answers: true } } },
    });

    return success(question);
  } catch (err) {
    return error(err);
  }
}
