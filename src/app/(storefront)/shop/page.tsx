import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/shop/ShopListing";
import type { SortOption } from "@/lib/data/products";

export const metadata: Metadata = { title: "Shop All" };

type SP = Record<string, string | undefined>;

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <ShopListing
      title="Shop All"
      description="Explore the full collection — considered pieces for every occasion."
      filters={{
        categorySlug: sp.category,
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
