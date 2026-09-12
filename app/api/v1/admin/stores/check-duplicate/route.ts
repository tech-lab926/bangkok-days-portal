import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("stores", "canView");

    const name = req.nextUrl.searchParams.get("name");
    if (!name) return success({ duplicate: false, store: null });

    const store = await prisma.place.findFirst({
      where: {
        translations: { some: { name: { equals: name, mode: "insensitive" } } },
      },
      select: {
        id: true,
        slug: true,
        translations: { where: { locale: "ja" }, select: { name: true } },
      },
    });

    return success({
      duplicate: !!store,
      store: store
        ? { id: store.id, slug: store.slug, name: store.translations[0]?.name || name }
        : null,
    });
  } catch (err) {
    return error(err);
  }
}
