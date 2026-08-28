import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { can } from "@/lib/auth/rbac";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCollection } from "@/actions/admin/collections";

export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const session = await requireAdmin("collections");
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Collections</h1>
        {can(session.role, "collections", "create") ? (
          <Link href="/admin/collections/new" className="btn-primary">
            Add Collection
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Products</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-b border-stone/60">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-noir/60">{c.type}</td>
                <td className="p-3">{c._count.products}</td>
                <td className="p-3">{c.isActive ? "Published" : "Draft"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/collections/${c.id}`} className="text-xs uppercase tracking-wide underline">
                      Edit
                    </Link>
                    {can(session.role, "collections", "delete") ? <DeleteButton action={deleteCollection.bind(null, c.id)} /> : null}
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
