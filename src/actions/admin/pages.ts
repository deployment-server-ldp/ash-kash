"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export async function savePage(id: string | null, formData: FormData) {
  await requireAdminAction("content", id ? "edit" : "create");
  const parsed = schema.parse(Object.fromEntries(formData.entries()));
  const data = {
    title: parsed.title,
    slug: parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.title),
    content: parsed.content || null,
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
    seoKeywords: parsed.seoKeywords || null,
    isPublished: parsed.isPublished ?? false,
  };
  let pageId = id;
  if (id) {
    await prisma.page.update({ where: { id }, data });
  } else {
    const created = await prisma.page.create({ data });
    pageId = created.id;
  }
  revalidatePath("/admin/pages");
  // New pages land back on their own edit screen so the section builder is one click away;
  // editing an existing one goes back to the list (matches the pre-existing behavior there).
  redirect(id ? "/admin/pages" : `/admin/pages/${pageId}`);
}

export async function deletePage(id: string) {
  await requireAdminAction("content", "delete");
  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
}
