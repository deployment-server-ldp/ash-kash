import Image from "next/image";
import { listProducts, getFilterOptions, type ProductFilters } from "@/lib/data/products";
import { ProductCard } from "../ProductCard";
import { FilterForm } from "./FilterForm";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { SortDropdown } from "./SortDropdown";
import { Pagination } from "./Pagination";

export async function ShopListing({
  title,
  description,
  bannerUrl,
  filters,
  rawSearchParams,
  hideCategoryFilter,
}: {
  title: string;
  description?: string | null;
  bannerUrl?: string | null;
  filters: ProductFilters;
  rawSearchParams: Record<string, string | undefined>;
  hideCategoryFilter?: boolean;
}) {
  const [{ items, total, page, pageCount }, { sizes, colors, categories }] = await Promise.all([
    listProducts(filters),
    getFilterOptions(),
  ]);

  return (
    <div>
      {bannerUrl ? (
        <div className="relative h-64 w-full">
          <Image src={bannerUrl} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-noir/30 text-center text-ivory">
            <h1 className="font-display text-4xl">{title}</h1>
            {description ? <p className="mt-2 max-w-lg text-ivory/90">{description}</p> : null}
          </div>
        </div>
      ) : (
        <div className="container-boutique py-10 text-center">
          <h1 className="font-display text-4xl">{title}</h1>
          {description ? <p className="mt-2 text-noir/60">{description}</p> : null}
        </div>
      )}

      <div className="container-boutique grid grid-cols-1 gap-10 pb-20 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FilterForm sizes={sizes} colors={colors} categories={categories} hideCategory={hideCategoryFilter} searchParams={rawSearchParams} />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-noir/60">{total} products</p>
            <div className="flex items-center gap-3">
              <MobileFilterDrawer>
                <FilterForm sizes={sizes} colors={colors} categories={categories} hideCategory={hideCategoryFilter} searchParams={rawSearchParams} />
              </MobileFilterDrawer>
              <SortDropdown />
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
              <p className="font-display text-2xl">No products found</p>
              <p className="text-noir/60">Try adjusting your filters or check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination page={page} pageCount={pageCount} searchParams={rawSearchParams} />
        </div>
      </div>
    </div>
  );
}
