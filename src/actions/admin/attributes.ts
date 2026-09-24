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
  imageUrl: z.string().optional(),
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
    imageUrl: formData.get("imageUrl") ?? undefined,
    sizeNames,
    measurementKeys,
  });

  const guide = await prisma.sizeGuide.create({
    data: { title: parsed.title, unit: parsed.unit, instructions: parsed.instructions || null, imageUrl: parsed.imageUrl || null },
  });

  if (parsed.sizeNames.length > 0) {
    await prisma.sizeGuideRow.createMany({
      data: parsed.sizeNames.map((sizeName, i) => ({
        sizeGuideId: guide.id,
        sizeName,
        position: i,
        measurements: Object.fromEntries(parsed.measurementKeys.map((k) => [k, ""])),
      })),
    });
  }

  revalidatePath("/admin/products/attributes");
}

export async function deleteSizeGuide(id: string) {
  await requireAdminAction("products", "delete");
  await prisma.sizeGuide.delete({ where: { id } });
  revalidatePath("/admin/products/attributes");
}

const sizeGuideDetailsSchema = z.object({
  title: z.string().min(1),
  unit: z.enum(["in", "cm"]),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function updateSizeGuideDetails(id: string, formData: FormData) {
  await requireAdminAction("products", "edit");
  const parsed = sizeGuideDetailsSchema.parse(Object.fromEntries(formData.entries()));
  await prisma.sizeGuide.update({
    where: { id },
    data: {
      title: parsed.title,
      unit: parsed.unit,
      instructions: parsed.instructions || null,
      imageUrl: parsed.imageUrl || null,
    },
  });
  revalidatePath(`/admin/products/attributes/size-guides/${id}`);
  revalidatePath("/", "layout");
}

/** Saves the measurement values entered for every row of a size guide in one submit. */
export async function updateSizeGuideRows(guideId: string, formData: FormData) {
  await requireAdminAction("products", "edit");
  const rows = await prisma.sizeGuideRow.findMany({ where: { sizeGuideId: guideId } });

  await prisma.$transaction(
    rows.map((row) => {
      const measurements = row.measurements as Record<string, string>;
      const updated = Object.fromEntries(
        Object.keys(measurements).map((key) => [key, String(formData.get(`row_${row.id}_${key}`) ?? "")])
      );
      return prisma.sizeGuideRow.update({ where: { id: row.id }, data: { measurements: updated } });
    })
  );

  revalidatePath(`/admin/products/attributes/size-guides/${guideId}`);
  revalidatePath("/", "layout");
}
