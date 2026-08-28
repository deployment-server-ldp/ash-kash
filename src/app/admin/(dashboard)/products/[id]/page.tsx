import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { ProductVariantsManager } from "@/components/admin/ProductVariantsManager";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("products", "edit");
  const { id } = await params;

  const [product, categories, brands, tags, sizeGuides, collections, sizes, colors] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { include: { size: true, color: true }, orderBy: { position: "asc" } },
        tags: true,
        collections: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.sizeGuide.findMany({ orderBy: { title: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.color.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Edit Product</h1>
        <Link href="/admin/products/attributes" className="text-sm underline">
          Manage Sizes, Colors, Brands &amp; Tags
        </Link>
      </div>

      <div className="mb-10 border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Images</h2>
        <ProductImagesManager productId={product.id} images={product.images} />
      </div>

      <div className="mb-10 border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Variants (Size / Color / Stock)</h2>
        <ProductVariantsManager productId={product.id} variants={product.variants} sizes={sizes} colors={colors} />
      </div>

      <ProductForm
        product={product}
        categories={categories}
        brands={brands}
        tags={tags}
        sizeGuides={sizeGuides}
        collections={collections}
        selectedTagIds={product.tags.map((t) => t.tagId)}
        selectedCollectionIds={product.collections.map((c) => c.collectionId)}
      />
    </div>
  );
}
