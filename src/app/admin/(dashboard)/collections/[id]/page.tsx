import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { CollectionForm } from "@/components/admin/CollectionForm";

export const metadata: Metadata = { title: "Edit Collection" };

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("collections", "edit");
  const { id } = await params;
  const [collection, products, categories, links] = await Promise.all([
    prisma.collection.findUnique({ where: { id } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collectionProduct.findMany({ where: { collectionId: id } }),
  ]);
  if (!collection) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Edit Collection</h1>
      <CollectionForm
        collection={collection}
        products={products}
        categories={categories}
        selectedProductIds={links.map((l) => l.productId)}
      />
    </div>
  );
}
