import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const metadata: Metadata = { title: "Add Blog Post" };

export default async function NewBlogPostPage() {
  await requireAdmin("blog", "create");
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Add Blog Post</h1>
      <BlogPostForm post={null} categories={categories} />
    </div>
  );
}
