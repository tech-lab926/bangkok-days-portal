import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";
import { errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("community", "canView");

    const { searchParams } = req.nextUrl;
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") || "100", 10)),
    );

    const posts = await prisma.communityPost.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    });

    return success({ items: posts });
  } catch (err) {
    return error(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("community", "canEdit");

    const { searchParams } = req.nextUrl;
    const body = await req.json();
    const id = searchParams.get("id") || body.id;
    const type = searchParams.get("type") || body.type; // 'post' or 'reply'

    const { hidden } = body;

    if (!id || !type) throw errors.badRequest("ID and type required");

    if (typeof hidden !== "boolean") {
      throw errors.badRequest("hidden must be boolean");
    }

    if (type === "post") {
      await prisma.communityPost.update({
        where: { id },
        data: { hidden },
      });
    } else if (type === "reply") {
      await prisma.communityReply.update({
        where: { id },
        data: { hidden },
      });
    } else {
      throw errors.badRequest("Invalid type");
    }

    return success({ updated: true });
  } catch (err) {
    return error(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("community", "canDelete");

    const { searchParams } = req.nextUrl;
    let body: { id?: string; type?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const id = searchParams.get("id") || body.id;
    const type = searchParams.get("type") || body.type;

    if (!id || !type) throw errors.badRequest("ID and type required");

    if (type === "post") {
      await prisma.communityPost.delete({ where: { id } });
    } else if (type === "reply") {
      await prisma.communityReply.delete({ where: { id } });
    } else {
      throw errors.badRequest("Invalid type");
    }

    return success({ deleted: true });
  } catch (err) {
    return error(err);
  }
}
