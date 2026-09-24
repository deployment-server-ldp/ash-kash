"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

const SECTION_TYPES = [
  "HERO_SLIDER",
  "FEATURED_CATEGORIES",
  "NEW_ARRIVALS",
  "FEATURED_PRODUCTS",
  "PROMO_BANNER",
  "BEST_SELLERS",
  "COLLECTION_SHOWCASE",
  "BRAND_STORY",
  "TESTIMONIALS",
  "INSTAGRAM",
  "NEWSLETTER",
] as const;

const sectionSchema = z.object({
  type: z.enum(SECTION_TYPES),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  imageUrl2: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  source: z.string().optional(),
  limit: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  isActive: z.coerce.boolean().optional(),
});

function pathsFor(pageId: string | null) {
  return pageId ? [`/admin/pages/${pageId}`] : ["/admin/content"];
}

export async function createHomepageSection(pageId: string | null, formData: FormData) {
  await requireAdminAction("content", "create");
  const productIds = formData.getAll("productIds").map(String);
  const parsed = sectionSchema.parse({ ...Object.fromEntries(formData.entries()), productIds });

  const settings =
    parsed.type === "FEATURED_PRODUCTS" || parsed.type === "NEW_ARRIVALS" || parsed.type === "BEST_SELLERS"
      ? { source: parsed.source || "latest", limit: parsed.limit ? Number(parsed.limit) : 8, productIds: parsed.productIds }
      : Prisma.JsonNull;

  const max = await prisma.homepageSection.aggregate({ where: { pageId }, _max: { sortOrder: true } });
  await prisma.homepageSection.create({
    data: {
      pageId,
      type: parsed.type,
      title: parsed.title || null,
      subtitle: parsed.subtitle || null,
      content: parsed.content || null,
      imageUrl: parsed.imageUrl || null,
      imageUrl2: parsed.imageUrl2 || null,
      buttonText: parsed.buttonText || null,
      buttonUrl: parsed.buttonUrl || null,
      settings,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
      isActive: parsed.isActive ?? true,
    },
  });
  for (const path of pathsFor(pageId)) revalidatePath(path);
  revalidatePath("/", "layout");
}

export async function updateHomepageSection(id: string, formData: FormData) {
  await requireAdminAction("content", "edit");
  const productIds = formData.getAll("productIds").map(String);
  const parsed = sectionSchema.parse({ ...Object.fromEntries(formData.entries()), productIds });

  const settings =
    parsed.type === "FEATURED_PRODUCTS" || parsed.type === "NEW_ARRIVALS" || parsed.type === "BEST_SELLERS"
      ? { source: parsed.source || "latest", limit: parsed.limit ? Number(parsed.limit) : 8, productIds: parsed.productIds }
      : Prisma.JsonNull;

  const updated = await prisma.homepageSection.update({
    where: { id },
    data: {
      title: parsed.title || null,
      subtitle: parsed.subtitle || null,
      content: parsed.content || null,
      imageUrl: parsed.imageUrl || null,
      imageUrl2: parsed.imageUrl2 || null,
      buttonText: parsed.buttonText || null,
      buttonUrl: parsed.buttonUrl || null,
      settings,
      isActive: parsed.isActive ?? false,
    },
  });
  for (const path of pathsFor(updated.pageId)) revalidatePath(path);
  revalidatePath("/", "layout");
}

export async function toggleHomepageSection(id: string, isActive: boolean) {
  await requireAdminAction("content", "edit");
  const updated = await prisma.homepageSection.update({ where: { id }, data: { isActive } });
  for (const path of pathsFor(updated.pageId)) revalidatePath(path);
  revalidatePath("/", "layout");
}

export async function deleteHomepageSection(id: string) {
  await requireAdminAction("content", "delete");
  const deleted = await prisma.homepageSection.delete({ where: { id } });
  for (const path of pathsFor(deleted.pageId)) revalidatePath(path);
  revalidatePath("/", "layout");
}

export async function moveHomepageSection(id: string, direction: "up" | "down") {
  await requireAdminAction("content", "edit");
  const current = await prisma.homepageSection.findUniqueOrThrow({ where: { id } });
  const sections = await prisma.homepageSection.findMany({
    where: { pageId: current.pageId },
    orderBy: { sortOrder: "asc" },
  });
  const index = sections.findIndex((s) => s.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= sections.length) return;
  const a = sections[index]!;
  const b = sections[swapWith]!;
  await prisma.$transaction([
    prisma.homepageSection.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.homepageSection.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  for (const path of pathsFor(current.pageId)) revalidatePath(path);
}
