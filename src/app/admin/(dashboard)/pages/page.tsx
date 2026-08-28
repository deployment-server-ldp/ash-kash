import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePage } from "@/actions/admin/pages";

export const metadata: Metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  await requireAdmin("content");
  const pages = await prisma.page.findMany({ orderBy: { title: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Pages</h1>
        <Link href="/admin/pages/new" className="btn-primary">
          Add Page
        </Link>
      </div>
      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-stone/60">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-noir/60">/pages/{p.slug}</td>
                <td className="p-3">{p.isPublished ? "Published" : "Draft"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/pages/${p.id}`} className="text-xs uppercase tracking-wide underline">
                      Edit
                    </Link>
                    <DeleteButton action={deletePage.bind(null, p.id)} />
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
