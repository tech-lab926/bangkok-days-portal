// GET/PUT banned words list (stored as comma-separated in GlobalSettings)
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";

const KEY = "banned_words";

export async function GET() {
  try {
    await requirePermission("settings", "canView");
    const row = await prisma.globalSettings.findUnique({ where: { key: KEY } });
    const words = row?.value ? row.value.split(",").map(w => w.trim()).filter(Boolean) : [];
    return success(words);
  } catch (err) {
    return error(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("settings", "canEdit");
    const { words } = await req.json();
    const value = (words as string[]).map(w => w.trim()).filter(Boolean).join(",");
    await prisma.globalSettings.upsert({
      where: { key: KEY },
      create: { key: KEY, value },
      update: { value },
    });
    return success({ updated: true });
  } catch (err) {
    return error(err);
  }
}
