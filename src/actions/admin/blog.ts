"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { getSession } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export async function saveBlogPost(id: string | null, formData: FormData) {
  await requireAdminAction("blog", id ? "edit" : "create");
  const session = await getSession();
  const parsed = postSchema.parse(Object.fromEntries(formData.entries()));
  const data = {
    title: parsed.title,
    slug: parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.title),
    excerpt: parsed.excerpt || null,
    content: parsed.content,
    featuredImage: parsed.featuredImage || null,
    categoryId: parsed.categoryId || null,
    authorId: session?.sub ?? null,
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
    isPublished: parsed.isPublished ?? false,
    publishedAt: parsed.isPublished ? new Date() : null,
  };
  if (id) {
    await prisma.blogPost.update({ where: { id }, data });
  } else {
    await prisma.blogPost.create({ data });
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  await requireAdminAction("blog", "delete");
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function createBlogCategory(formData: FormData) {
  await requireAdminAction("blog", "create");
  const name = z.string().min(1).parse(formData.get("name"));
  await prisma.blogCategory.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/blog");
}
