import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { MenuLocation } from "@prisma/client";

export type ResolvedMenuItem = {
  id: string;
  label: string;
  url: string;
  children: ResolvedMenuItem[];
};

function resolveUrl(item: {
  type: string;
  url: string | null;
  categorySlug?: string | null;
  collectionSlug?: string | null;
  productSlug?: string | null;
  pageSlug?: string | null;
}): string {
  switch (item.type) {
    case "CATEGORY":
      return item.categorySlug ? `/category/${item.categorySlug}` : "#";
    case "COLLECTION":
      return item.collectionSlug ? `/collection/${item.collectionSlug}` : "#";
    case "PRODUCT":
      return item.productSlug ? `/product/${item.productSlug}` : "#";
    case "PAGE":
      return item.pageSlug ? `/pages/${item.pageSlug}` : "#";
    default:
      return item.url ?? "#";
  }
}

export const getMenu = cache(async (location: MenuLocation): Promise<ResolvedMenuItem[]> => {
  const menu = await prisma.menu.findUnique({
    where: { location },
    include: {
      items: {
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  if (!menu) return [];

  const categoryIds = new Set<string>();
  const collectionIds = new Set<string>();
  const productIds = new Set<string>();
  const pageIds = new Set<string>();

  for (const item of menu.items) {
    for (const target of [item, ...item.children]) {
      if (target.categoryId) categoryIds.add(target.categoryId);
      if (target.collectionId) collectionIds.add(target.collectionId);
      if (target.productId) productIds.add(target.productId);
      if (target.pageId) pageIds.add(target.pageId);
    }
  }

  const [categories, collections, products, pages] = await Promise.all([
    categoryIds.size ? prisma.category.findMany({ where: { id: { in: [...categoryIds] } } }) : [],
    collectionIds.size ? prisma.collection.findMany({ where: { id: { in: [...collectionIds] } } }) : [],
    productIds.size ? prisma.product.findMany({ where: { id: { in: [...productIds] } } }) : [],
    pageIds.size ? prisma.page.findMany({ where: { id: { in: [...pageIds] } } }) : [],
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c.slug]));
  const colMap = new Map(collections.map((c) => [c.id, c.slug]));
  const prodMap = new Map(products.map((p) => [p.id, p.slug]));
  const pageMap = new Map(pages.map((p) => [p.id, p.slug]));

  function build(item: (typeof menu.items)[number]): ResolvedMenuItem {
    return {
      id: item.id,
      label: item.label,
      url: resolveUrl({
        type: item.type,
        url: item.url,
        categorySlug: item.categoryId ? catMap.get(item.categoryId) : null,
        collectionSlug: item.collectionId ? colMap.get(item.collectionId) : null,
        productSlug: item.productId ? prodMap.get(item.productId) : null,
        pageSlug: item.pageId ? pageMap.get(item.pageId) : null,
      }),
      children: item.children.map((child) =>
        build({ ...child, children: [] } as (typeof menu.items)[number])
      ),
    };
  }

  return menu.items.map(build);
});
