"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  parentId: z.string().optional(),
  sizeGuideId: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveCategory(id: string | null, formData: FormData) {
  await requireAdminAction("categories", id ? "edit" : "create");
  const parsed = schema.parse(Object.fromEntries(formData.entries()));

  const data = {
    name: parsed.name,
    slug: parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.name),
    description: parsed.description || null,
    imageUrl: parsed.imageUrl || null,
    bannerUrl: parsed.bannerUrl || null,
    parentId: parsed.parentId || null,
    sizeGuideId: parsed.sizeGuideId || null,
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
    isActive: parsed.isActive ?? false,
  };

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
    await prisma.category.create({ data: { ...data, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 } });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdminAction("categories", "delete");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

export async function moveCategory(id: string, direction: "up" | "down") {
  await requireAdminAction("categories", "edit");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const index = categories.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= categories.length) return;

  const a = categories[index]!;
  const b = categories[swapWith]!;
  await prisma.$transaction([
    prisma.category.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.category.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}
