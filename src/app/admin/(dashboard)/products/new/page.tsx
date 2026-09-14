import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getDefaultCurrency } from "@/lib/currency/service";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  await requireAdmin("products", "create");
  const [categories, brands, tags, sizeGuides, collections, baseCurrency] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.sizeGuide.findMany({ orderBy: { title: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    getDefaultCurrency(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Add Product</h1>
        <Link href="/admin/products/attributes" className="text-sm underline">
          Manage Sizes, Colors, Brands &amp; Tags
        </Link>
      </div>
      <p className="mb-6 text-sm text-noir/60">
        Save the product first — you&apos;ll then be able to add images and size/color variants.
      </p>
      <ProductForm
        product={null}
        categories={categories}
        brands={brands}
        tags={tags}
        sizeGuides={sizeGuides}
        collections={collections}
        selectedTagIds={[]}
        selectedCollectionIds={[]}
        baseCurrencyCode={baseCurrency.code}
      />
    </div>
  );
}
