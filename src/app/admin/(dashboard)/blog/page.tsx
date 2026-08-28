import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { createBlogCategory, deleteBlogPost } from "@/actions/admin/blog";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  await requireAdmin("blog");
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Blog</h1>
        <Link href="/admin/blog/new" className="btn-primary">
          Add Post
        </Link>
      </div>

      <div className="mb-8 overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Published</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-stone/60">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-noir/60">{p.category?.name ?? "—"}</td>
                <td className="p-3">{p.isPublished ? "Published" : "Draft"}</td>
                <td className="p-3 text-noir/50">{p.publishedAt?.toLocaleDateString() ?? "—"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/blog/${p.id}`} className="text-xs uppercase tracking-wide underline">
                      Edit
                    </Link>
                    <DeleteButton action={deleteBlogPost.bind(null, p.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-stone bg-ivory p-5">
        <h2 className="mb-3 font-display text-lg">Blog Categories</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="border border-stone px-3 py-1 text-sm">
              {c.name}
            </span>
          ))}
        </div>
        <form action={createBlogCategory} className="flex gap-2">
          <input name="name" placeholder="New category" required className="input max-w-xs" />
          <button type="submit" className="btn-outline">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
