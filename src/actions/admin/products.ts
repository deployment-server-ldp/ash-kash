"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  sku: z.string().min(1),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  sizeGuideId: z.string().optional(),
  productType: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.string().optional(),
  costPrice: z.string().optional(),
  taxRate: z.coerce.number().default(0),
  trackInventory: z.coerce.boolean().optional(),
  inventoryQuantity: z.coerce.number().default(0),
  lowStockThreshold: z.coerce.number().default(5),
  weight: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isSale: z.coerce.boolean().optional(),
  badge: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
});

export async function saveProduct(id: string | null, formData: FormData) {
  await requireAdminAction("products", id ? "edit" : "create");
  const raw = Object.fromEntries(formData.entries());
  const tagIds = formData.getAll("tagIds").map(String);
  const collectionIds = formData.getAll("collectionIds").map(String);
  const parsed = productSchema.parse({ ...raw, tagIds, collectionIds });

  const data = {
    name: parsed.name,
    slug: parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.name),
    sku: parsed.sku,
    brandId: parsed.brandId || null,
    categoryId: parsed.categoryId || null,
    sizeGuideId: parsed.sizeGuideId || null,
    productType: parsed.productType || null,
    shortDescription: parsed.shortDescription || null,
    description: parsed.description || null,
    videoUrl: parsed.videoUrl || null,
    price: parsed.price,
    compareAtPrice: parsed.compareAtPrice ? Number(parsed.compareAtPrice) : null,
    costPrice: parsed.costPrice ? Number(parsed.costPrice) : null,
    taxRate: parsed.taxRate,
    trackInventory: parsed.trackInventory ?? false,
    inventoryQuantity: parsed.inventoryQuantity,
    lowStockThreshold: parsed.lowStockThreshold,
    weight: parsed.weight ? Number(parsed.weight) : null,
    status: parsed.status,
    isFeatured: parsed.isFeatured ?? false,
    isBestSeller: parsed.isBestSeller ?? false,
    isNewArrival: parsed.isNewArrival ?? false,
    isSale: parsed.isSale ?? false,
    badge: parsed.badge || null,
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
    seoKeywords: parsed.seoKeywords || null,
    publishedAt: parsed.status === "ACTIVE" ? new Date() : null,
  };

  let productId = id;
  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    const created = await prisma.product.create({ data });
    productId = created.id;
  }

  await prisma.productTag.deleteMany({ where: { productId: productId! } });
  if (parsed.tagIds && parsed.tagIds.length > 0) {
    await prisma.productTag.createMany({ data: parsed.tagIds.map((tagId) => ({ productId: productId!, tagId })) });
  }

  await prisma.collectionProduct.deleteMany({ where: { productId: productId! } });
  if (parsed.collectionIds && parsed.collectionIds.length > 0) {
    await prisma.collectionProduct.createMany({
      data: parsed.collectionIds.map((collectionId, i) => ({ collectionId, productId: productId!, sortOrder: i })),
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}`);
}

export async function deleteProduct(id: string) {
  await requireAdminAction("products", "delete");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function addProductImage(productId: string, url: string, altText: string): Promise<{ error?: string }> {
  await requireAdminAction("products", "edit");
  try {
    const count = await prisma.productImage.count({ where: { productId } });
    await prisma.productImage.create({
      data: { productId, url, altText: altText || null, position: count, isPrimary: count === 0 },
    });
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    // Surfaced to the admin UI instead of thrown — an uncaught error here would otherwise
    // crash the whole page with a production error digest that hides the real cause.
    return { error: error instanceof Error ? error.message : "Could not add the image." };
  }
}

export async function deleteProductImage(imageId: string, productId: string) {
  await requireAdminAction("products", "edit");
  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function setPrimaryImage(imageId: string, productId: string) {
  await requireAdminAction("products", "edit");
  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/", "layout");
}

export async function reorderProductImage(imageId: string, productId: string, direction: "up" | "down") {
  await requireAdminAction("products", "edit");
  const images = await prisma.productImage.findMany({ where: { productId }, orderBy: { position: "asc" } });
  const index = images.findIndex((i) => i.id === imageId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= images.length) return;
  const a = images[index]!;
  const b = images[swapWith]!;
  await prisma.$transaction([
    prisma.productImage.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.productImage.update({ where: { id: b.id }, data: { position: a.position } }),
  ]);
  revalidatePath(`/admin/products/${productId}`);
}

const variantSchema = z.object({
  sizeId: z.string().optional(),
  colorId: z.string().optional(),
  sku: z.string().min(1),
  price: z.string().optional(),
  compareAtPrice: z.string().optional(),
  inventoryQuantity: z.coerce.number().default(0),
  imageUrl: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveVariant(productId: string, variantId: string | null, formData: FormData) {
  const session = await requireAdminAction("products", "edit");
  const parsed = variantSchema.parse(Object.fromEntries(formData.entries()));

  const size = parsed.sizeId ? await prisma.size.findUnique({ where: { id: parsed.sizeId } }) : null;
  const color = parsed.colorId ? await prisma.color.findUnique({ where: { id: parsed.colorId } }) : null;
  const title = [size?.name, color?.name].filter(Boolean).join(" / ") || null;

  const data = {
    productId,
    sizeId: parsed.sizeId || null,
    colorId: parsed.colorId || null,
    sku: parsed.sku,
    title,
    price: parsed.price ? Number(parsed.price) : null,
    compareAtPrice: parsed.compareAtPrice ? Number(parsed.compareAtPrice) : null,
    inventoryQuantity: parsed.inventoryQuantity,
    imageUrl: parsed.imageUrl || null,
    isActive: parsed.isActive ?? true,
  };

  if (variantId) {
    const previous = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    const variant = await prisma.productVariant.update({ where: { id: variantId }, data });
    if (previous.inventoryQuantity !== variant.inventoryQuantity) {
      await prisma.inventoryHistory.create({
        data: {
          productId,
          productVariantId: variant.id,
          userId: session.sub,
          type: "SET",
          quantityChange: variant.inventoryQuantity - previous.inventoryQuantity,
          quantityAfter: variant.inventoryQuantity,
          note: "Updated from admin panel",
        },
      });
    }
  } else {
    const count = await prisma.productVariant.count({ where: { productId } });
    const variant = await prisma.productVariant.create({ data: { ...data, position: count } });
    await prisma.inventoryHistory.create({
      data: {
        productId,
        productVariantId: variant.id,
        userId: session.sub,
        type: "SET",
        quantityChange: variant.inventoryQuantity,
        quantityAfter: variant.inventoryQuantity,
        note: "Created from admin panel",
      },
    });
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/", "layout");
}

export async function deleteVariant(variantId: string, productId: string) {
  await requireAdminAction("products", "edit");
  await prisma.productVariant.delete({ where: { id: variantId } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function quickCreateBrand(name: string) {
  await requireAdminAction("products", "create");
  return prisma.brand.create({ data: { name, slug: slugify(name) } });
}

export async function quickCreateTag(name: string) {
  await requireAdminAction("products", "create");
  return prisma.tag.create({ data: { name, slug: slugify(name) } });
}

export async function quickCreateSize(name: string) {
  await requireAdminAction("products", "create");
  const max = await prisma.size.aggregate({ _max: { sortOrder: true } });
  return prisma.size.create({ data: { name, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
}

export async function quickCreateColor(name: string, hexValue: string) {
  await requireAdminAction("products", "create");
  const max = await prisma.color.aggregate({ _max: { sortOrder: true } });
  return prisma.color.create({ data: { name, hexValue, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
}
