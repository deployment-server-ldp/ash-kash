import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Add Category" };

export default async function NewCategoryPage() {
  await requireAdmin("categories", "create");
  const [categories, sizeGuides] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.sizeGuide.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Add Category</h1>
      <CategoryForm category={null} categories={categories} sizeGuides={sizeGuides} />
    </div>
  );
}
