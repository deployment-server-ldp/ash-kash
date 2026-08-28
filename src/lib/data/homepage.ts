import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getProductsByIds, listProducts, toCardVM } from "./products";
import type { ProductCardVM } from "@/types/product";

export const getHomepageSections = cache(async () => {
  return prisma.homepageSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
});

export const getActiveSlider = cache(async (location: string = "home_hero") => {
  const slider = await prisma.slider.findFirst({
    where: { location, isActive: true },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!slider) return [];
  const now = new Date();
  return slider.items.filter(
    (item) => (!item.startDate || item.startDate <= now) && (!item.endDate || item.endDate >= now)
  );
});

type FeaturedSettings = {
  source?: "latest" | "featured" | "best_seller" | "new_arrival" | "sale" | "custom";
  limit?: number;
  productIds?: string[];
};

export async function resolveFeaturedProducts(settings: unknown): Promise<ProductCardVM[]> {
  const config = (settings ?? {}) as FeaturedSettings;
  const limit = config.limit ?? 8;

  if (config.source === "custom" && config.productIds?.length) {
    return (await getProductsByIds(config.productIds)).slice(0, limit);
  }

  const filterFlags: Record<string, boolean> = {};
  if (config.source === "featured") filterFlags.isFeatured = true;
  if (config.source === "best_seller") filterFlags.isBestSeller = true;
  if (config.source === "new_arrival") filterFlags.isNewArrival = true;
  if (config.source === "sale") filterFlags.isSale = true;

  const where = { status: "ACTIVE" as const, ...filterFlags };
  const items = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { position: "asc" as const }, take: 2 },
      variants: { where: { isActive: true }, select: { inventoryQuantity: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy:
      config.source === "best_seller"
        ? [{ isBestSeller: "desc" }, { reviewsCount: "desc" }]
        : [{ createdAt: "desc" }],
    take: limit,
  });
  return items.map(toCardVM);
}

export const getFeaturedCategories = cache(async (limit = 3) => {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
});

export const getShowcaseCollections = cache(async (limit = 2) => {
  return prisma.collection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: limit });
});

export const getActiveTestimonials = cache(async () => {
  return prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
});

export { listProducts };
