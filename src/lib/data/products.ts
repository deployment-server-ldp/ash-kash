import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCardVM, ProductDetailVM } from "@/types/product";

export const PAGE_SIZE = 12;

export type SortOption = "featured" | "newest" | "price_low" | "price_high" | "best_selling" | "popular";

export type ProductFilters = {
  categorySlug?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStock?: boolean;
  onSale?: boolean;
  tag?: string;
  query?: string;
  sort?: SortOption;
  page?: number;
};

const cardInclude = Prisma.validator<Prisma.ProductInclude>()({
  images: { orderBy: { position: "asc" }, take: 2 },
  variants: { where: { isActive: true }, select: { inventoryQuantity: true } },
  category: { select: { name: true, slug: true } },
});

type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export function toCardVM(p: CardRow): ProductCardVM {
  const totalVariantStock = p.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
  const inStock = !p.trackInventory || (p.variants.length > 0 ? totalVariantStock > 0 : p.inventoryQuantity > 0);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    isFeatured: p.isFeatured,
    isSale: p.isSale,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    badge: p.badge,
    primaryImage: p.images[0]?.url ?? null,
    hoverImage: p.images[1]?.url ?? null,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    inStock,
  };
}

function sortToOrderBy(sort?: SortOption): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price_low":
      return [{ price: "asc" }];
    case "price_high":
      return [{ price: "desc" }];
    case "best_selling":
      return [{ isBestSeller: "desc" }, { reviewsCount: "desc" }];
    case "popular":
      return [{ reviewsCount: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }
}

async function buildWhere(filters: ProductFilters): Promise<Prisma.ProductWhereInput> {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (filters.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: filters.categorySlug },
      include: { children: true },
    });
    if (category) {
      where.categoryId = { in: [category.id, ...category.children.map((c) => c.id)] };
    } else {
      where.id = "__none__";
    }
  }

  if (filters.collectionSlug) {
    const collection = await prisma.collection.findUnique({ where: { slug: filters.collectionSlug } });
    if (collection) {
      if (collection.type === "MANUAL") {
        where.collections = { some: { collectionId: collection.id } };
      } else {
        const rules = (collection.rules ?? {}) as Record<string, unknown>;
        if (rules.isFeatured) where.isFeatured = true;
        if (rules.isBestSeller) where.isBestSeller = true;
        if (rules.isNewArrival) where.isNewArrival = true;
        if (rules.isSale) where.isSale = true;
        if (typeof rules.categorySlug === "string") {
          const cat = await prisma.category.findUnique({ where: { slug: rules.categorySlug } });
          if (cat) where.categoryId = cat.id;
        }
      }
    } else {
      where.id = "__none__";
    }
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.size) where.variants = { some: { size: { name: filters.size } } };
  if (filters.color) where.variants = { ...where.variants, some: { color: { name: filters.color } } };
  if (filters.onSale) where.isSale = true;
  if (filters.tag) where.tags = { some: { tag: { slug: filters.tag } } };

  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query } },
      { sku: { contains: filters.query } },
      { description: { contains: filters.query } },
      { tags: { some: { tag: { name: { contains: filters.query } } } } },
      { category: { name: { contains: filters.query } } },
    ];
  }

  return where;
}

export async function listProducts(filters: ProductFilters) {
  const where = await buildWhere(filters);
  const page = Math.max(1, filters.page ?? 1);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: cardInclude,
      orderBy: sortToOrderBy(filters.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  let filtered = items;
  if (filters.inStock) {
    filtered = items.filter((p) => {
      if (!p.trackInventory) return true;
      const variantStock = p.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
      return p.variants.length > 0 ? variantStock > 0 : p.inventoryQuantity > 0;
    });
  }

  return {
    items: filtered.map(toCardVM),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetailVM | null> {
  const p = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      brand: true,
      sizeGuide: { include: { rows: { orderBy: { position: "asc" } } } },
      tags: { include: { tag: true } },
      variants: { where: { isActive: true }, include: { size: true, color: true }, orderBy: { position: "asc" } },
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!p) return null;

  const totalVariantStock = p.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
  const inStock = !p.trackInventory || (p.variants.length > 0 ? totalVariantStock > 0 : p.inventoryQuantity > 0);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    isFeatured: p.isFeatured,
    isSale: p.isSale,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    badge: p.badge,
    primaryImage: p.images[0]?.url ?? null,
    hoverImage: p.images[1]?.url ?? null,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    categoryId: p.categoryId,
    inStock,
    shortDescription: p.shortDescription,
    description: p.description,
    videoUrl: p.videoUrl,
    trackInventory: p.trackInventory,
    inventoryQuantity: p.inventoryQuantity,
    weight: p.weight ? Number(p.weight) : null,
    brandName: p.brand?.name ?? null,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    ratingAvg: Number(p.ratingAvg),
    reviewsCount: p.reviewsCount,
    images: p.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText, isPrimary: img.isPrimary })),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      price: v.price ? Number(v.price) : null,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      inventoryQuantity: v.inventoryQuantity,
      imageUrl: v.imageUrl,
      sizeId: v.sizeId,
      sizeName: v.size?.name ?? null,
      colorId: v.colorId,
      colorName: v.color?.name ?? null,
      colorHex: v.color?.hexValue ?? null,
      isActive: v.isActive,
    })),
    tags: p.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, slug: t.tag.slug })),
    reviews: p.reviews.map((r) => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
    sizeGuide: p.sizeGuide
      ? {
          id: p.sizeGuide.id,
          title: p.sizeGuide.title,
          unit: p.sizeGuide.unit,
          instructions: p.sizeGuide.instructions,
          rows: p.sizeGuide.rows.map((r) => ({
            id: r.id,
            sizeName: r.sizeName,
            measurements: r.measurements as Record<string, string>,
          })),
        }
      : null,
  };
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string): Promise<ProductCardVM[]> {
  if (!categoryId) return [];
  const items = await prisma.product.findMany({
    where: { categoryId, status: "ACTIVE", id: { not: excludeId } },
    include: cardInclude,
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  return items.map(toCardVM);
}

export async function getFilterOptions() {
  const [sizes, colors, categories] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.color.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { sizes, colors, categories };
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardVM[]> {
  if (ids.length === 0) return [];
  const items = await prisma.product.findMany({ where: { id: { in: ids }, status: "ACTIVE" }, include: cardInclude });
  const map = new Map(items.map((p) => [p.id, p]));
  return ids
    .map((id) => map.get(id))
    .filter((p): p is CardRow => Boolean(p))
    .map(toCardVM);
}
