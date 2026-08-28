"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { slugify } from "@/lib/utils";

export async function createSize(formData: FormData) {
  await requireAdminAction("products", "create");
  const name = z.string().min(1).parse(formData.get("name"));
  const max = await prisma.size.aggregate({ _max: { sortOrder: true } });
  await prisma.size.create({ data: { name, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  revalidatePath("/admin/products/attributes");
}

export async function deleteSize(id: string) {
  await requireAdminAction("products", "delete");
  await prisma.size.delete({ where: { id } });
  revalidatePath("/admin/products/attributes");
}

export async function createColor(formData: FormData) {
  await requireAdminAction("products", "create");
  const name = z.string().min(1).parse(formData.get("name"));
  const hexValue = z.string().optional().parse(formData.get("hexValue") ?? undefined);
  const max = await prisma.color.aggregate({ _max: { sortOrder: true } });
  await prisma.color.create({ data: { name, hexValue: hexValue || null, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  revalidatePath("/admin/products/attributes");
}

export async function deleteColor(id: string) {
  await requireAdminAction("products", "delete");
  await prisma.color.delete({ where: { id } });
  revalidatePath("/admin/products/attributes");
}

export async function createBrand(formData: FormData) {
  await requireAdminAction("products", "create");
  const name = z.string().min(1).parse(formData.get("name"));
  await prisma.brand.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/products/attributes");
}

export async function deleteBrand(id: string) {
  await requireAdminAction("products", "delete");
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/products/attributes");
}

export async function createTag(formData: FormData) {
  await requireAdminAction("products", "create");
  const name = z.string().min(1).parse(formData.get("name"));
  await prisma.tag.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/products/attributes");
}

export async function deleteTag(id: string) {
  await requireAdminAction("products", "delete");
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/products/attributes");
}

const sizeGuideSchema = z.object({
  title: z.string().min(1),
  unit: z.enum(["in", "cm"]),
  instructions: z.string().optional(),
  sizeNames: z.array(z.string()),
  measurementKeys: z.array(z.string()),
});

export async function createSizeGuide(formData: FormData) {
  await requireAdminAction("products", "create");
  const sizeNames = String(formData.get("sizeNames") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const measurementKeys = String(formData.get("measurementKeys") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const parsed = sizeGuideSchema.parse({
    title: formData.get("title"),
    unit: formData.get("unit"),
    instructions: formData.get("instructions") ?? undefined,
    sizeNames,
    measurementKeys,
  });

  const guide = await prisma.sizeGuide.create({
    data: { title: parsed.title, unit: parsed.unit, instructions: parsed.instructions || null },
  });

  await prisma.sizeGuideRow.createMany({
    data: parsed.sizeNames.map((sizeName, i) => ({
      sizeGuideId: guide.id,
      sizeName,
      position: i,
      measurements: Object.fromEntries(parsed.measurementKeys.map((k) => [k, ""])),
    })),
  });

  revalidatePath("/admin/products/attributes");
}

export async function deleteSizeGuide(id: string) {
  await requireAdminAction("products", "delete");
  await prisma.sizeGuide.delete({ where: { id } });
  revalidatePath("/admin/products/attributes");
}
