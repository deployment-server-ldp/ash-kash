import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopListing } from "@/components/storefront/shop/ShopListing";
import type { SortOption } from "@/lib/data/products";

type SP = Record<string, string | undefined>;
type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await prisma.category.findUnique({ where: { slug, isActive: true } });
  if (!category) notFound();

  return (
    <ShopListing
      title={category.name}
      description={category.description}
      bannerUrl={category.bannerUrl}
      hideCategoryFilter
      filters={{
        categorySlug: slug,
        minPrice: sp.min_price ? Number(sp.min_price) : undefined,
        maxPrice: sp.max_price ? Number(sp.max_price) : undefined,
        size: sp.size,
        color: sp.color,
        inStock: sp.in_stock === "1",
        onSale: sp.on_sale === "1",
        sort: sp.sort as SortOption | undefined,
        page: sp.page ? Number(sp.page) : 1,
      }}
      rawSearchParams={sp}
    />
  );
}
