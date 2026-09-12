import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/auth";
import { errors } from "@/lib/errors";

function makeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || null;
}

export async function GET() {
  try {
    await requireAuth();
    const scenes = await prisma.scene.findMany({
      orderBy: { displayOrder: "asc" },
      include: { translations: { where: { locale: "ja" } }, _count: { select: { places: true } } },
    });
    return success(scenes);
  } catch (err) { return error(err); }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("scenes", "canCreate");
    const { name, slug: rawSlug, icon, displayOrder = 0, enabled = true } = await req.json();
    if (!name) throw errors.badRequest("シーン名は必須です");

    const slug = rawSlug?.trim() || makeSlug(name);
    const scene = await prisma.scene.create({
      data: {
        displayOrder, enabled,
        slug: slug || undefined,
        icon: icon || null,
        translations: { create: { locale: "ja", name } },
      },
      include: { translations: true },
    });
    return success(scene, 201);
  } catch (err) { return error(err); }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("scenes", "canEdit");
    const body = await req.json();

    if (Array.isArray(body)) {
      for (const { id, name, displayOrder, enabled, slug, icon } of body) {
        const data: any = {};
        if (displayOrder !== undefined) data.displayOrder = displayOrder;
        if (enabled !== undefined) data.enabled = enabled;
        if (slug !== undefined) data.slug = slug || null;
        if (icon !== undefined) data.icon = icon || null;
        await prisma.scene.update({ where: { id }, data });
        if (name !== undefined) {
          await prisma.sceneTranslation.updateMany({ where: { sceneId: id, locale: "ja" }, data: { name } });
        }
      }
      return success({ updated: true });
    }

    const { id, name, slug, icon, displayOrder, enabled } = body;
    if (!id) throw errors.badRequest("シーンIDが必要です");
    const data: any = {};
    if (displayOrder !== undefined) data.displayOrder = displayOrder;
    if (enabled !== undefined) data.enabled = enabled;
    if (slug !== undefined) data.slug = slug || null;
    if (icon !== undefined) data.icon = icon || null;
    await prisma.scene.update({ where: { id }, data });
    if (name !== undefined) {
      await prisma.sceneTranslation.updateMany({ where: { sceneId: id, locale: "ja" }, data: { name } });
    }
    return success({ updated: true });
  } catch (err) { return error(err); }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("scenes", "canDelete");
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw errors.badRequest("IDが必要です");
    await prisma.scene.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) { return error(err); }
}
