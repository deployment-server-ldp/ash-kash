import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/shop/ShopListing";
import type { SortOption } from "@/lib/data/products";

type SP = Record<string, string | undefined>;

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const query = sp.q ?? "";

  return (
    <ShopListing
      title={query ? `Results for "${query}"` : "Search"}
      description={query ? undefined : "Enter a search term to find products."}
      filters={{
        query,
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
