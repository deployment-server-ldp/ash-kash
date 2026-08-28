import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopListing } from "@/components/storefront/shop/ShopListing";
import type { SortOption } from "@/lib/data/products";

type SP = Record<string, string | undefined>;
type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({ where: { slug } });
  if (!collection) return {};
  return {
    title: collection.seoTitle ?? collection.name,
    description: collection.seoDescription ?? collection.description ?? undefined,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const collection = await prisma.collection.findUnique({ where: { slug, isActive: true } });
  if (!collection) notFound();

  return (
    <ShopListing
      title={collection.name}
      description={collection.description}
      bannerUrl={collection.imageUrl}
      filters={{
        collectionSlug: slug,
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
