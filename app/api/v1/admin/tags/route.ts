import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/auth";
import { errors } from "@/lib/errors";

function makeSlug(name: string, fallback: string) {
  const s = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return s || fallback;
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await prisma.tag.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  try {
    await requireAuth();
    const tags = await prisma.tag.findMany({
      orderBy: [{ category: "asc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        translations: { where: { locale: "ja" } },
        _count: { select: { placeTags: true } },
      },
    });
    return success(tags);
  } catch (err) {
    return error(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("tags", "canCreate");
    const { name, slug: rawSlug, category, displayOrder = 0 } = await req.json();
    if (!name) throw errors.badRequest("タグ名は必須です");

    const base = rawSlug?.trim() || makeSlug(name, `tag-${Date.now()}`);
    const slug = await uniqueSlug(base);

    const tag = await prisma.tag.create({
      data: {
        slug,
        category: category || null,
        displayOrder,
        translations: { create: { locale: "ja", name } },
      },
      include: { translations: true },
    });
    return success(tag, 201);
  } catch (err) {
    return error(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("tags", "canEdit");
    const body = await req.json();

    // Bulk reorder
    if (Array.isArray(body)) {
      for (const { id, displayOrder } of body) {
        await prisma.tag.update({ where: { id }, data: { displayOrder } });
      }
      return success({ updated: true });
    }

    const { id, name, slug: rawSlug, category, displayOrder } = body;
    if (!id) throw errors.badRequest("ID is required");

    const updateData: any = {};
    if (rawSlug !== undefined) updateData.slug = rawSlug.trim() || makeSlug(name || "", `tag-${Date.now()}`);
    if (category !== undefined) updateData.category = category || null;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    await prisma.tag.update({ where: { id }, data: updateData });

    if (name !== undefined) {
      const existing = await prisma.tagTranslation.findFirst({ where: { tagId: id, locale: "ja" } });
      if (existing) {
        await prisma.tagTranslation.update({ where: { id: existing.id }, data: { name } });
      } else {
        await prisma.tagTranslation.create({ data: { tagId: id, locale: "ja", name } });
      }
    }

    const tag = await prisma.tag.findUnique({ where: { id }, include: { translations: true } });
    return success(tag);
  } catch (err) {
    return error(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("tags", "canDelete");
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw errors.badRequest("ID is required");
    await prisma.tag.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return error(err);
  }
}
