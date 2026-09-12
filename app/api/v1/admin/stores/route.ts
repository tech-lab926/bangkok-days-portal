import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, paginated } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";
import { errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("stores", "canView");

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50")),
    );
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") as "NORMAL" | "NIGHT" | null;
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    const areaId = searchParams.get("areaId");
    const stationId = searchParams.get("stationId");
    const categoryId = searchParams.get("categoryId");

    const where: any = {};
    if (type) where.type = type;
    if (areaId) where.areaId = areaId;
    if (stationId) where.nearestStation = stationId;
    if (categoryId) where.categories = { some: { categoryId } };
    if (search) {
      where.translations = {
        some: { name: { contains: search, mode: "insensitive" } },
      };
    }

    const orderBy: any = {};
    if (sortBy === "name") {
      // Sort by name requires special handling
      orderBy.translations = { _count: sortOrder };
    } else if (sortBy === "updatedAt") {
      orderBy.updatedAt = sortOrder;
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder;
    }

    const [stores, total] = await Promise.all([
      prisma.place.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy:
          sortBy === "displayPriority"
            ? { displayPriority: sortOrder }
            : sortBy === "updatedAt"
            ? { updatedAt: sortOrder }
            : { createdAt: sortOrder },
        include: {
          translations: { where: { locale: "ja" } },
          area: { include: { translations: { where: { locale: "ja" } } } },
          categories: {
            include: {
              category: {
                include: { translations: { where: { locale: "ja" } } },
              },
            },
          },
          scenes: {
            include: {
              scene: { include: { translations: { where: { locale: "ja" } } } },
            },
          },
          tags: {
            include: {
              tag: { include: { translations: { where: { locale: "ja" } } } },
            },
          },
          owner: true,
        },
      }),
      prisma.place.count({ where }),
    ]);

    return paginated(stores, total, page, limit);
  } catch (err) {
    return error(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("stores", "canCreate");

    const body = await req.json();
    const {
      name,
      description = "",
      slug,
      type = "NORMAL",
      areaId,
      ownerId,
      phone,
      address,
      openingHours,
      price,
      menu,
      nearestStation,
      regularHoliday,
      languages = [],
      website,
      snsInstagram,
      snsX,
      snsFacebook,
      snsLine,
      snsTiktok,
      isVisible = false,
      showSpotlight = false,
      showNightNavi = false,
      displayPriority = 0,
      categoryIds = [],
      sceneIds = [],
      tagIds = [],
      images = [],
      googleMapsUrl,
      googleRating,
      googleReviewCount,
      priceFrom,
      priceTo,
      seoTitle,
      seoDescription,
      h1Tag,
      noindex = false,
    } = body;

    if (!name) throw errors.badRequest("店舗名は必須です");
    if (!slug) throw errors.badRequest("スラッグは必須です");

    // Duplicate check — by slug or name
    const existingBySlug = await prisma.place.findUnique({ where: { slug } });
    if (existingBySlug) throw errors.badRequest(`スラッグ「${slug}」は既に使用されています`);

    const existingByName = await prisma.place.findFirst({
      where: { translations: { some: { name: { equals: name, mode: "insensitive" } } } },
      include: { translations: { where: { locale: "ja" } } },
    });
    if (existingByName) {
      const existingName = existingByName.translations[0]?.name || existingByName.slug;
      throw errors.badRequest(`同名の店舗「${existingName}」が既に登録されています（slug: ${existingByName.slug}）`);
    }

    // Auto-inherit plan priority if no manual override
    let effectivePriority = displayPriority;
    if (!effectivePriority && ownerId) {
      const owner = await prisma.owner.findUnique({
        where: { id: ownerId },
        include: { plan: true },
      });
      effectivePriority = owner?.plan?.displayPriority ?? 0;
    }

    // Auto-generate SEO fields if not provided
    let areaName = "";
    if (areaId) {
      const area = await prisma.area.findUnique({
        where: { id: areaId },
        include: { translations: { where: { locale: "ja" } } },
      });
      areaName = area?.translations[0]?.name || "";
    }

    let categoryName = "";
    if (categoryIds && categoryIds.length > 0) {
      const category = await prisma.category.findUnique({
        where: { id: categoryIds[0] },
        include: { translations: { where: { locale: "ja" } } },
      });
      categoryName = category?.translations[0]?.name || "";
    }

    const finalArea = areaName || "バンコク";
    const finalCategory = categoryName || "お店";

    const finalSeoTitle = seoTitle?.trim() || `${name} | ${finalArea}の${finalCategory}`;
    const finalH1 = h1Tag?.trim() || name;
    const finalSeoDescription = seoDescription?.trim() || `${name}は${finalArea}にある${finalCategory}です。 営業時間・料金・写真・アクセスなどの店舗情報を掲載しています。`;

    const place = await prisma.place.create({
      data: {
        slug,
        type,
        isVisible,
        areaId: areaId || null,
        ownerId: ownerId || null,
        phone,
        address,
        openingHours,
        price: price || null,
        menu: menu || null,
        nearestStation,
        regularHoliday,
        languages,
        website,
        snsInstagram,
        snsX,
        snsFacebook,
        snsLine,
        snsTiktok,
        showSpotlight,
        showNightNavi,
        displayPriority: effectivePriority,
        googleMapsUrl: googleMapsUrl || null,
        googleRating: typeof googleRating === "number" ? googleRating : (googleRating ? parseFloat(googleRating) : null),
        googleReviewCount: typeof googleReviewCount === "number" ? googleReviewCount : (googleReviewCount ? parseInt(googleReviewCount) : null),
        priceFrom: typeof priceFrom === "number" ? priceFrom : (priceFrom ? parseInt(priceFrom) : null),
        priceTo: typeof priceTo === "number" ? priceTo : (priceTo ? parseInt(priceTo) : null),
        seoTitle: finalSeoTitle,
        seoDescription: finalSeoDescription,
        h1Tag: finalH1,
        noindex,
        translations: {
          create: { locale: "ja", name, description },
        },
        categories: {
          create: categoryIds.map((id: string) => ({ categoryId: id })),
        },
        scenes: {
          create: sceneIds.map((id: string) => ({ sceneId: id })),
        },
        tags: {
          create: tagIds.map((id: string) => ({ tagId: id })),
        },
        images: {
          create: (images as { url: string; alt?: string }[]).map((img, i) => ({
            url: img.url,
            alt: img.alt || "",
            isMain: i === 0,
            order: i,
          })),
        },
      },
      include: {
        translations: true,
        categories: {
          include: { category: { include: { translations: true } } },
        },
        scenes: { include: { scene: { include: { translations: true } } } },
        tags: { include: { tag: { include: { translations: true } } } },
        area: { include: { translations: true } },
        owner: true,
      },
    });

    return success(place, 201);
  } catch (err) {
    return error(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("stores", "canEdit");

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) throw errors.badRequest("店舗IDが必要です");

    const body = await req.json();
    const {
      name,
      description,
      slug,
      type,
      areaId,
      ownerId,
      phone,
      address,
      openingHours,
      nearestStation,
      regularHoliday,
      languages,
      website,
      snsInstagram,
      snsX,
      snsFacebook,
      snsLine,
      snsTiktok,
      isVisible,
      showSpotlight,
      showNightNavi,
      displayPriority,
      categoryIds,
      sceneIds,
      tagIds,
      images,
    } = body;

    const updateData: any = {};
    if (slug !== undefined) updateData.slug = slug;
    if (type !== undefined) updateData.type = type;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (areaId !== undefined) updateData.areaId = areaId || null;
    if (ownerId !== undefined) updateData.ownerId = ownerId || null;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (openingHours !== undefined) updateData.openingHours = openingHours;
    if (body.price !== undefined) updateData.price = body.price || null;
    if (body.menu !== undefined) updateData.menu = body.menu || null;
    if (nearestStation !== undefined)
      updateData.nearestStation = nearestStation;
    if (regularHoliday !== undefined)
      updateData.regularHoliday = regularHoliday;
    if (languages !== undefined) updateData.languages = languages;
    if (website !== undefined) updateData.website = website;
    if (snsInstagram !== undefined) updateData.snsInstagram = snsInstagram;
    if (snsX !== undefined) updateData.snsX = snsX;
    if (snsFacebook !== undefined) updateData.snsFacebook = snsFacebook;
    if (snsLine !== undefined) updateData.snsLine = snsLine;
    if (snsTiktok !== undefined) updateData.snsTiktok = snsTiktok;
    if (showSpotlight !== undefined) updateData.showSpotlight = showSpotlight;
    if (showNightNavi !== undefined) updateData.showNightNavi = showNightNavi;
    if (body.googleMapsUrl !== undefined) updateData.googleMapsUrl = body.googleMapsUrl || null;
    if (body.googleRating !== undefined) updateData.googleRating = body.googleRating !== null && body.googleRating !== "" ? parseFloat(body.googleRating) : null;
    if (body.googleReviewCount !== undefined) updateData.googleReviewCount = body.googleReviewCount !== null && body.googleReviewCount !== "" ? parseInt(body.googleReviewCount) : null;
    if (body.priceFrom !== undefined) updateData.priceFrom = body.priceFrom !== null && body.priceFrom !== "" ? parseInt(body.priceFrom) : null;
    if (body.priceTo !== undefined) updateData.priceTo = body.priceTo !== null && body.priceTo !== "" ? parseInt(body.priceTo) : null;
    if (body.seoTitle !== undefined || body.seoDescription !== undefined || body.h1Tag !== undefined) {
      const currentPlace = await prisma.place.findUnique({
        where: { id },
        include: {
          translations: { where: { locale: "ja" } },
          categories: true,
        },
      });

      const resolvedName = name !== undefined ? name : (currentPlace?.translations[0]?.name || "");
      const resolvedAreaId = areaId !== undefined ? areaId : currentPlace?.areaId;
      const resolvedCategoryIds = categoryIds !== undefined ? categoryIds : currentPlace?.categories.map(c => c.categoryId);

      let areaName = "";
      if (resolvedAreaId) {
        const area = await prisma.area.findUnique({
          where: { id: resolvedAreaId },
          include: { translations: { where: { locale: "ja" } } },
        });
        areaName = area?.translations[0]?.name || "";
      }

      let categoryName = "";
      if (resolvedCategoryIds && resolvedCategoryIds.length > 0) {
        const category = await prisma.category.findUnique({
          where: { id: resolvedCategoryIds[0] },
          include: { translations: { where: { locale: "ja" } } },
        });
        categoryName = category?.translations[0]?.name || "";
      }

      const finalArea = areaName || "バンコク";
      const finalCategory = categoryName || "お店";

      if (body.seoTitle !== undefined) {
        updateData.seoTitle = body.seoTitle?.trim() || `${resolvedName} | ${finalArea}の${finalCategory}`;
      }
      if (body.h1Tag !== undefined) {
        updateData.h1Tag = body.h1Tag?.trim() || resolvedName;
      }
      if (body.seoDescription !== undefined) {
        updateData.seoDescription = body.seoDescription?.trim() || `${resolvedName}は${finalArea}にある${finalCategory}です。 営業時間・料金・写真・アクセスなどの店舗情報を掲載しています。`;
      }
    }
    if (body.noindex !== undefined) updateData.noindex = body.noindex;
    if (displayPriority !== undefined) {
      const parsed = parseInt(displayPriority);
      if (parsed > 0) {
        // Manual override
        updateData.displayPriority = parsed;
      } else {
        // Auto-inherit from owner's plan
        const resolvedOwnerId = ownerId !== undefined ? ownerId : (
          await prisma.place.findUnique({ where: { id }, select: { ownerId: true } })
        )?.ownerId;
        if (resolvedOwnerId) {
          const owner = await prisma.owner.findUnique({
            where: { id: resolvedOwnerId },
            include: { plan: true },
          });
          updateData.displayPriority = owner?.plan?.displayPriority ?? 0;
        } else {
          updateData.displayPriority = 0;
        }
      }
    }

    if (name !== undefined || description !== undefined) {
      const existing = await prisma.placeTranslation.findFirst({
        where: { placeId: id, locale: "ja" },
      });
      if (existing) {
        updateData.translations = {
          update: {
            where: { id: existing.id },
            data: {
              ...(name !== undefined && { name }),
              ...(description !== undefined && { description }),
            },
          },
        };
      } else {
        updateData.translations = {
          create: {
            locale: "ja",
            name: name || "",
            description: description || "",
          },
        };
      }
    }

    if (categoryIds !== undefined) {
      updateData.categories = {
        deleteMany: {},
        create: categoryIds.map((cid: string) => ({ categoryId: cid })),
      };
    }

    if (sceneIds !== undefined) {
      updateData.scenes = {
        deleteMany: {},
        create: sceneIds.map((sid: string) => ({ sceneId: sid })),
      };
    }

    if (tagIds !== undefined) {
      updateData.tags = {
        deleteMany: {},
        create: tagIds.map((tid: string) => ({ tagId: tid })),
      };
    }

    if (images !== undefined) {
      updateData.images = {
        deleteMany: {},
        create: (images as { url: string; alt?: string }[]).map((img, i) => ({
          url: img.url,
          alt: img.alt || "",
          isMain: i === 0,
          order: i,
        })),
      };
    }

    const place = await prisma.place.update({
      where: { id },
      data: updateData,
      include: {
        translations: true,
        categories: {
          include: { category: { include: { translations: true } } },
        },
        scenes: { include: { scene: { include: { translations: true } } } },
        tags: { include: { tag: { include: { translations: true } } } },
        area: { include: { translations: true } },
        owner: true,
        images: true,
      },
    });

    return success(place);
  } catch (err) {
    return error(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("stores", "canDelete");

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) throw errors.badRequest("店舗IDが必要です");

    // Delete billing records first (no cascade on this relation)
    await prisma.storeBilling.deleteMany({ where: { placeId: id } });
    await prisma.place.delete({ where: { id } });

    return success({ deleted: true });
  } catch (err) {
    return error(err);
  }
}
