import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Edit Category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("categories", "edit");
  const { id } = await params;
  const [category, categories, sizeGuides] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.sizeGuide.findMany({ orderBy: { title: "asc" } }),
  ]);
  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Edit Category</h1>
      <CategoryForm category={category} categories={categories} sizeGuides={sizeGuides} />
    </div>
  );
}
