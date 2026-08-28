"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import type { MenuLocation } from "@prisma/client";

export async function getOrCreateMenu(location: MenuLocation) {
  const existing = await prisma.menu.findUnique({ where: { location } });
  if (existing) return existing;
  return prisma.menu.create({ data: { name: location === "HEADER" ? "Header Menu" : "Footer Menu", location } });
}

const itemSchema = z.object({
  label: z.string().min(1),
  type: z.enum(["CUSTOM", "CATEGORY", "COLLECTION", "PRODUCT", "PAGE"]),
  url: z.string().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  productId: z.string().optional(),
  pageId: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveMenuItem(menuId: string, id: string | null, formData: FormData) {
  await requireAdminAction("navigation", id ? "edit" : "create");
  const parsed = itemSchema.parse(Object.fromEntries(formData.entries()));
  const data = {
    menuId,
    label: parsed.label,
    type: parsed.type,
    url: parsed.type === "CUSTOM" ? parsed.url || null : null,
    categoryId: parsed.type === "CATEGORY" ? parsed.categoryId || null : null,
    collectionId: parsed.type === "COLLECTION" ? parsed.collectionId || null : null,
    productId: parsed.type === "PRODUCT" ? parsed.productId || null : null,
    pageId: parsed.type === "PAGE" ? parsed.pageId || null : null,
    parentId: parsed.parentId || null,
    isActive: parsed.isActive ?? false,
  };

  if (id) {
    await prisma.menuItem.update({ where: { id }, data });
  } else {
    const max = await prisma.menuItem.aggregate({ where: { menuId, parentId: data.parentId }, _max: { sortOrder: true } });
    await prisma.menuItem.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  revalidatePath("/admin/navigation");
  revalidatePath("/", "layout");
}

export async function deleteMenuItem(id: string) {
  await requireAdminAction("navigation", "delete");
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/navigation");
  revalidatePath("/", "layout");
}

export async function moveMenuItem(id: string, direction: "up" | "down") {
  await requireAdminAction("navigation", "edit");
  const item = await prisma.menuItem.findUniqueOrThrow({ where: { id } });
  const siblings = await prisma.menuItem.findMany({
    where: { menuId: item.menuId, parentId: item.parentId },
    orderBy: { sortOrder: "asc" },
  });
  const index = siblings.findIndex((s) => s.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;
  const a = siblings[index]!;
  const b = siblings[swapWith]!;
  await prisma.$transaction([
    prisma.menuItem.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.menuItem.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidatePath("/admin/navigation");
  revalidatePath("/", "layout");
}
