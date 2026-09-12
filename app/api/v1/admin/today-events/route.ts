import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { requirePermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requirePermission("today_events", "canView");
    const events = await prisma.todayEvent.findMany({
      orderBy: [{ eventDate: "desc" }, { eventTime: "asc" }],
    });
    return success(events);
  } catch (err) {
    return error(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("today_events", "canCreate");
    const body = await req.json();
    const event = await prisma.todayEvent.create({
      data: {
        eventTime: body.eventTime,
        area: body.area,
        title: body.title,
        description: body.description || null,
        imageUrls: body.imageUrls || [],
        eventDate: new Date(body.eventDate),
        active: body.active ?? true,
        contactUrl: body.contactUrl || null,
        lineId: body.lineId || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
      },
    });
    return success(event);
  } catch (err) {
    return error(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("today_events", "canEdit");
    const body = await req.json();
    const { id, ...data } = body;
    const event = await prisma.todayEvent.update({
      where: { id },
      data: {
        ...(data.eventTime !== undefined && { eventTime: data.eventTime }),
        ...(data.area !== undefined && { area: data.area }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrls !== undefined && { imageUrls: data.imageUrls }),
        ...(data.eventDate !== undefined && { eventDate: new Date(data.eventDate) }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.contactUrl !== undefined && { contactUrl: data.contactUrl || null }),
        ...(data.lineId !== undefined && { lineId: data.lineId || null }),
        ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail || null }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone || null }),
      },
    });
    return success(event);
  } catch (err) {
    return error(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("today_events", "canDelete");
    const { id } = await req.json();
    await prisma.todayEvent.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return error(err);
  }
}
