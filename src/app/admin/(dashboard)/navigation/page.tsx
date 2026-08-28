import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getOrCreateMenu } from "@/actions/admin/navigation";
import { MenuEditor } from "@/components/admin/MenuEditor";

export const metadata: Metadata = { title: "Navigation" };

export default async function AdminNavigationPage() {
  await requireAdmin("navigation");

  const [headerMenu, footerMenu, categories, collections, products, pages] = await Promise.all([
    getOrCreateMenu("HEADER"),
    getOrCreateMenu("FOOTER"),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.page.findMany({ orderBy: { title: "asc" } }),
  ]);

  const [headerItems, footerItems] = await Promise.all([
    prisma.menuItem.findMany({
      where: { menuId: headerMenu.id, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.menuItem.findMany({
      where: { menuId: footerMenu.id, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Navigation</h1>
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 font-display text-xl">Header Menu</h2>
          <MenuEditor menuId={headerMenu.id} items={headerItems} categories={categories} collections={collections} products={products} pages={pages} />
        </section>
        <section>
          <h2 className="mb-4 font-display text-xl">Footer Menu</h2>
          <MenuEditor menuId={footerMenu.id} items={footerItems} categories={categories} collections={collections} products={products} pages={pages} />
        </section>
      </div>
    </div>
  );
}
