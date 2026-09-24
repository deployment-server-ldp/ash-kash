import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { PageForm } from "@/components/admin/PageForm";
import { HomepageSectionCard } from "@/components/admin/HomepageSectionCard";
import { AddHomepageSectionForm } from "@/components/admin/AddHomepageSectionForm";

export const metadata: Metadata = { title: "Edit Page" };

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content", "edit");
  const { id } = await params;
  const [page, sections, products] = await Promise.all([
    prisma.page.findUnique({ where: { id } }),
    prisma.homepageSection.findMany({ where: { pageId: id }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Edit Page</h1>
      <PageForm page={page} />

      <div className="mt-10 border-t border-stone pt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl">Page Sections</h2>
            <p className="mt-1 max-w-2xl text-sm text-noir/60">
              Build this page out of the same sections used on the homepage (hero slider, product grids, banners, etc).
              If you add any sections here, they replace the plain text content above when this page is shown.
            </p>
          </div>
          <AddHomepageSectionForm pageId={page.id} />
        </div>
        <div className="space-y-4">
          {sections.map((s, i) => (
            <HomepageSectionCard key={s.id} section={s} products={products} isFirst={i === 0} isLast={i === sections.length - 1} />
          ))}
          {sections.length === 0 ? (
            <p className="text-noir/50">No sections yet — this page will show its plain text content instead.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
