import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { HomepageSectionCard } from "@/components/admin/HomepageSectionCard";
import { AddHomepageSectionForm } from "@/components/admin/AddHomepageSectionForm";

export const metadata: Metadata = { title: "Homepage" };

export default async function AdminHomepagePage() {
  await requireAdmin("content");
  const [sections, products] = await Promise.all([
    prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Homepage Sections</h1>
        <AddHomepageSectionForm />
      </div>
      <p className="mb-6 text-sm text-noir/60">
        Reorder, enable/disable, and configure each section of your homepage. For the hero slider, manage individual
        slides under <strong>Content → Sliders</strong>.
      </p>
      <div className="space-y-4">
        {sections.map((s, i) => (
          <HomepageSectionCard key={s.id} section={s} products={products} isFirst={i === 0} isLast={i === sections.length - 1} />
        ))}
        {sections.length === 0 ? <p className="text-noir/50">No sections yet. Add one above.</p> : null}
      </div>
    </div>
  );
}
