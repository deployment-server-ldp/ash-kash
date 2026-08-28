"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { hashPassword } from "@/lib/auth/password";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().optional(),
  userRole: z.enum(["SUPER_ADMIN", "MANAGER", "PRODUCT_MANAGER", "ORDER_MANAGER", "CONTENT_MANAGER"]),
  isActive: z.coerce.boolean().optional(),
});

export async function saveAdminUser(id: string | null, formData: FormData) {
  await requireAdminAction("users", id ? "edit" : "create");
  const parsed = schema.parse(Object.fromEntries(formData.entries()));

  if (id) {
    const data: { name: string; email: string; userRole: typeof parsed.userRole; isActive: boolean; password?: string } = {
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      userRole: parsed.userRole,
      isActive: parsed.isActive ?? false,
    };
    if (parsed.password) data.password = await hashPassword(parsed.password);
    await prisma.user.update({ where: { id }, data });
  } else {
    if (!parsed.password) throw new Error("Password is required for new admin users.");
    await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email.toLowerCase(),
        password: await hashPassword(parsed.password),
        userRole: parsed.userRole,
        isActive: parsed.isActive ?? true,
      },
    });
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteAdminUser(id: string) {
  await requireAdminAction("users", "delete");
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
