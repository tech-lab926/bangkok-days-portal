import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/auth";
import { errors } from "@/lib/errors";

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  try {
    await requireAuth();

    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        translations: { where: { locale: "ja" } },
        _count: { select: { places: true } },
      },
    });

    return success(categories);
  } catch (err) {
    return error(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("categories", "canCreate");

    const body = await req.json();
    const { name, slug: rawSlug, displayOrder = 0, enabled = true, description, seoTitle, seoDescription, imageUrl } = body;

    if (!name) throw errors.badRequest("カテゴリ名は必須です");

    const base = normalizeSlug(rawSlug || "") || normalizeSlug(name) || `cat-${Date.now()}`;
    const slug = await uniqueSlug(base);

    const category = await prisma.category.create({
      data: {
        slug, displayOrder, enabled,
        description: description || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        imageUrl: imageUrl || null,
        translations: { create: { locale: "ja", name } },
      },
      include: { translations: true },
    });

    return success(category, 201);
  } catch (err) {
    return error(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("categories", "canEdit");

    const body = await req.json();

    if (Array.isArray(body)) {
      for (const item of body) {
        const { id, name, displayOrder, enabled, slug } = item;
        const updateData: any = {};
        if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
        if (enabled !== undefined) updateData.enabled = enabled;
        if (slug !== undefined) updateData.slug = slug;

        await prisma.category.update({
          where: { id },
          data: updateData,
        });

        if (name !== undefined) {
          await prisma.categoryTranslation.updateMany({
            where: { categoryId: id, locale: "ja" },
            data: { name },
          });
        }
      }
      return success({ updated: true });
    }

    const { id, name, slug: rawSlug, displayOrder, enabled, description, seoTitle, seoDescription, imageUrl } = body;
    if (!id) throw errors.badRequest("カテゴリIDが必要です");

    const updateData: any = {};
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (rawSlug !== undefined) {
      const normalizedSlug = normalizeSlug(rawSlug);
      if (!normalizedSlug) throw errors.badRequest("スラッグは英数字とハイフンで入力してください");
      updateData.slug = normalizedSlug;
    }
    if (description !== undefined) updateData.description = description || null;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle || null;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;

    await prisma.category.update({
      where: { id },
      data: updateData,
    });

    if (name !== undefined) {
      await prisma.categoryTranslation.updateMany({
        where: { categoryId: id, locale: "ja" },
        data: { name },
      });
    }

    return success({ updated: true });
  } catch (err) {
    return error(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("categories", "canDelete");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) throw errors.badRequest("カテゴリIDが必要です");

    // Check if category has associated places
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { places: true } } },
    });

    if (!category) throw errors.notFound("カテゴリが見つかりません");

    if (category._count.places > 0) {
      throw errors.badRequest(
        `このカテゴリには${category._count.places}件の店舗が関連付けられています。削除する前に店舗の関連付けを解除してください。`,
      );
    }

    // Delete translations first
    await prisma.categoryTranslation.deleteMany({
      where: { categoryId: id },
    });

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    return success({ deleted: true });
  } catch (err) {
    return error(err);
  }
}
