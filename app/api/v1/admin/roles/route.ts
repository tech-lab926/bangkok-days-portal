import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { errors } from "@/lib/errors";
import { SYSTEM_ROLE_CODES } from "@/lib/permissions-config";
import { z } from "zod";

const roleSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(
      /^[A-Z0-9_]+$/,
      "Role code must use uppercase letters, numbers, or underscores",
    ),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().nullable(),
});

// GET /api/v1/admin/roles — list all roles (system + custom)
export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN"]);
    const roles = await prisma.customRole.findMany({
      orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
    });
    return success({ roles });
  } catch (err) {
    return error(err);
  }
}

// POST /api/v1/admin/roles — create a new custom role
export async function POST(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    const data = roleSchema.parse(await req.json());

    if (
      SYSTEM_ROLE_CODES.includes(
        data.code as (typeof SYSTEM_ROLE_CODES)[number],
      )
    ) {
      throw errors.badRequest("System roles already exist and cannot be re-created");
    }

    const existing = await prisma.customRole.findUnique({
      where: { code: data.code },
    });
    if (existing) throw errors.badRequest("Role code already exists");

    const role = await prisma.customRole.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        isSystem: false,
      },
    });

    return success(role, 201);
  } catch (err) {
    return error(err);
  }
}

// PATCH /api/v1/admin/roles?id=... — update name/description of a custom role
export async function PATCH(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) throw errors.badRequest("Role ID required");

    const body = await req.json();
    const updateSchema = roleSchema.partial().omit({ code: true });
    const data = updateSchema.parse(body);

    const target = await prisma.customRole.findUnique({ where: { id } });
    if (!target) throw errors.notFound("Role not found");
    if (target.isSystem) throw errors.forbidden();

    const role = await prisma.customRole.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description || null }
          : {}),
      },
    });

    return success(role);
  } catch (err) {
    return error(err);
  }
}

// DELETE /api/v1/admin/roles?id=... — delete a custom role (not system, not in use)
export async function DELETE(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) throw errors.badRequest("Role ID required");

    const target = await prisma.customRole.findUnique({ where: { id } });
    if (!target) throw errors.notFound("Role not found");
    if (target.isSystem) throw errors.forbidden();

    // Check if any admin user has this custom role assigned
    const assignedCount = await prisma.adminUser.count({
      where: { customRole: target.code },
    });
    if (assignedCount > 0) {
      throw errors.badRequest(
        `このロールは ${assignedCount} 人のユーザーに割り当てられているため削除できません`,
      );
    }

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { role: target.code } }),
      prisma.customRole.delete({ where: { id } }),
    ]);

    return success({ deleted: true });
  } catch (err) {
    return error(err);
  }
}
