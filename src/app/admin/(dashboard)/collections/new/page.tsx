import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { CollectionForm } from "@/components/admin/CollectionForm";

export const metadata: Metadata = { title: "Add Collection" };

export default async function NewCollectionPage() {
  await requireAdmin("collections", "create");
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Add Collection</h1>
      <CollectionForm collection={null} products={products} categories={categories} selectedProductIds={[]} />
    </div>
  );
}
