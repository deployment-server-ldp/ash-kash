"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

const testimonialSchema = z.object({
  name: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().min(1),
  imageUrl: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

function revalidate() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}

export async function saveTestimonial(id: string | null, formData: FormData) {
  await requireAdminAction("content", id ? "edit" : "create");
  const parsed = testimonialSchema.parse(Object.fromEntries(formData.entries()));
  const data = {
    name: parsed.name,
    rating: parsed.rating,
    content: parsed.content,
    imageUrl: parsed.imageUrl || null,
    isActive: parsed.isActive ?? false,
  };

  if (id) {
    await prisma.testimonial.update({ where: { id }, data });
  } else {
    const max = await prisma.testimonial.aggregate({ _max: { sortOrder: true } });
    await prisma.testimonial.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  revalidate();
}

export async function deleteTestimonial(id: string) {
  await requireAdminAction("content", "delete");
  await prisma.testimonial.delete({ where: { id } });
  revalidate();
}

export async function moveTestimonial(id: string, direction: "up" | "down") {
  await requireAdminAction("content", "edit");
  const items = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  const index = items.findIndex((t) => t.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= items.length) return;
  // Re-number everything so ties (e.g. several rows at sortOrder 0) can't make a move a no-op.
  const ordered = [...items];
  [ordered[index], ordered[swapWith]] = [ordered[swapWith]!, ordered[index]!];
  await prisma.$transaction(ordered.map((t, i) => prisma.testimonial.update({ where: { id: t.id }, data: { sortOrder: i } })));
  revalidate();
}

export async function toggleTestimonial(id: string, isActive: boolean) {
  await requireAdminAction("content", "edit");
  await prisma.testimonial.update({ where: { id }, data: { isActive } });
  revalidate();
}
