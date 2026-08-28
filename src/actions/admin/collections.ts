"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
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
  type: z.enum(["MANUAL", "AUTOMATIC"]),
  productIds: z.array(z.string()).optional(),
  ruleCategorySlug: z.string().optional(),
  ruleFeatured: z.coerce.boolean().optional(),
  ruleBestSeller: z.coerce.boolean().optional(),
  ruleNewArrival: z.coerce.boolean().optional(),
  ruleSale: z.coerce.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveCollection(id: string | null, formData: FormData) {
  await requireAdminAction("collections", id ? "edit" : "create");
  const raw = Object.fromEntries(formData.entries());
  const productIds = formData.getAll("productIds").map(String);
  const parsed = schema.parse({ ...raw, productIds });

  const rules =
    parsed.type === "AUTOMATIC"
      ? {
          categorySlug: parsed.ruleCategorySlug || undefined,
          isFeatured: parsed.ruleFeatured || undefined,
          isBestSeller: parsed.ruleBestSeller || undefined,
          isNewArrival: parsed.ruleNewArrival || undefined,
          isSale: parsed.ruleSale || undefined,
        }
      : Prisma.JsonNull;

  const data = {
    name: parsed.name,
    slug: parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.name),
    description: parsed.description || null,
    imageUrl: parsed.imageUrl || null,
    type: parsed.type,
    rules,
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
    isActive: parsed.isActive ?? false,
  };

  let collectionId = id;
  if (id) {
    await prisma.collection.update({ where: { id }, data });
  } else {
    const created = await prisma.collection.create({ data });
    collectionId = created.id;
  }

  if (parsed.type === "MANUAL" && collectionId) {
    await prisma.collectionProduct.deleteMany({ where: { collectionId } });
    if (parsed.productIds && parsed.productIds.length > 0) {
      await prisma.collectionProduct.createMany({
        data: parsed.productIds.map((productId, i) => ({ collectionId: collectionId!, productId, sortOrder: i })),
      });
    }
  }

  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
  redirect("/admin/collections");
}

export async function deleteCollection(id: string) {
  await requireAdminAction("collections", "delete");
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/admin/collections");
}
