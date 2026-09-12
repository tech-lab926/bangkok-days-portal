import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/auth";
import { errors } from "@/lib/errors";

export async function GET() {
  try {
    await requireAuth();

    const areas = await prisma.area.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        translations: { where: { locale: "ja" } },
        _count: { select: { places: true } },
      },
    });

    return success(areas);
  } catch (err) {
    return error(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("areas", "canCreate");

    const body = await req.json();
    const { name, slug, displayOrder = 0, enabled = true, imageUrl, description, ratingJapanese = 0, ratingNightlife = 0, ratingBeginner = 0, ratingNightCaution = 0, btsStation, googleMapsUrl, seoTitle, seoDescription } = body;

    if (!name) throw errors.badRequest("エリア名は必須です");
    if (!slug) throw errors.badRequest("スラッグは必須です");
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw errors.badRequest("スラッグは半角英数字とハイフンのみ使用できます");
    }

    const area = await prisma.area.create({
      data: {
        slug,
        displayOrder,
        enabled,
        imageUrl,
        description,
        btsStation: btsStation || null,
        googleMapsUrl: googleMapsUrl || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        ratingJapanese,
        ratingNightlife,
        ratingBeginner,
        ratingNightCaution,
        translations: {
          create: { locale: "ja", name },
        },
      },
      include: { translations: true },
    });

    return success(area, 201);
  } catch (err) {
    return error(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("areas", "canEdit");

    const body = await req.json();

    if (Array.isArray(body)) {
      // Bulk update (order, enabled, name)
      for (const item of body) {
        const { id, name, slug, displayOrder, enabled } = item;
        const updateData: any = {};
        if (slug !== undefined) updateData.slug = slug;
        if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
        if (enabled !== undefined) updateData.enabled = enabled;

        await prisma.area.update({
          where: { id },
          data: updateData,
        });

        if (name !== undefined) {
          await prisma.areaTranslation.updateMany({
            where: { areaId: id, locale: "ja" },
            data: { name },
          });
        }
      }
      return success({ updated: true });
    }

    const { id, name, slug, displayOrder, enabled, imageUrl, description, ratingJapanese, ratingNightlife, ratingBeginner, ratingNightCaution, seoTitle, seoDescription, googleMapsUrl, btsStation } = body;
    if (!id) throw errors.badRequest("エリアIDが必要です");

    const updateData: any = {};
    if (slug !== undefined) updateData.slug = slug;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (description !== undefined) updateData.description = description;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle || null;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription || null;
    if (googleMapsUrl !== undefined) updateData.googleMapsUrl = googleMapsUrl || null;
    if (btsStation !== undefined) updateData.btsStation = btsStation || null;
    if (ratingJapanese !== undefined) updateData.ratingJapanese = parseInt(ratingJapanese);
    if (ratingNightlife !== undefined) updateData.ratingNightlife = parseInt(ratingNightlife);
    if (ratingBeginner !== undefined) updateData.ratingBeginner = parseInt(ratingBeginner);
    if (ratingNightCaution !== undefined) updateData.ratingNightCaution = parseInt(ratingNightCaution);

    const area = await prisma.area.update({
      where: { id },
      data: updateData,
      include: { translations: true },
    });

    if (name !== undefined) {
      await prisma.areaTranslation.updateMany({
        where: { areaId: id, locale: "ja" },
        data: { name },
      });
    }

    return success(area);
  } catch (err) {
    return error(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("areas", "canDelete");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) throw errors.badRequest("エリアIDが必要です");

    // Check if area has associated places
    const area = await prisma.area.findUnique({
      where: { id },
      include: { _count: { select: { places: true } } },
    });

    if (!area) throw errors.notFound("エリアが見つかりません");

    if (area._count.places > 0) {
      throw errors.badRequest(
        `このエリアには${area._count.places}件の店舗が関連付けられています。削除する前に店舗の関連付けを解除してください。`,
      );
    }

    // Delete translations first
    await prisma.areaTranslation.deleteMany({
      where: { areaId: id },
    });

    // Delete area
    await prisma.area.delete({
      where: { id },
    });

    return success({ deleted: true });
  } catch (err) {
    return error(err);
  }
}
