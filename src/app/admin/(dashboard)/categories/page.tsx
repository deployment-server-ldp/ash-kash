import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { can } from "@/lib/auth/rbac";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { deleteCategory, moveCategory } from "@/actions/admin/categories";

export const metadata: Metadata = { title: "Categories" };
const PLACEHOLDER = "/images/placeholder-product.svg";

export default async function AdminCategoriesPage() {
  const session = await requireAdmin("categories");
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } }, parent: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Categories</h1>
        {can(session.role, "categories", "create") ? (
          <Link href="/admin/categories/new" className="btn-primary">
            Add Category
          </Link>
        ) : null}
      </div>

      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Order</th>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Products</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.id} className="border-b border-stone/60">
                <td className="p-3">
                  <ReorderButtons
                    onMoveUp={moveCategory.bind(null, c.id, "up")}
                    onMoveDown={moveCategory.bind(null, c.id, "down")}
                    disableUp={i === 0}
                    disableDown={i === categories.length - 1}
                  />
                </td>
                <td className="p-3">
                  <div className="relative h-10 w-10 overflow-hidden bg-stone">
                    <Image src={c.imageUrl ?? PLACEHOLDER} alt={c.name} fill className="object-cover" />
                  </div>
                </td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-noir/60">{c.parent?.name ?? "—"}</td>
                <td className="p-3">{c._count.products}</td>
                <td className="p-3">{c.isActive ? "Active" : "Hidden"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/categories/${c.id}`} className="text-xs uppercase tracking-wide underline">
                      Edit
                    </Link>
                    {can(session.role, "categories", "delete") ? (
                      <DeleteButton action={deleteCategory.bind(null, c.id)} />
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
