"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

export async function getOrCreateDefaultSlider() {
  const existing = await prisma.slider.findFirst({ where: { location: "home_hero" } });
  if (existing) return existing;
  return prisma.slider.create({ data: { name: "Homepage Hero", location: "home_hero", isActive: true } });
}

const slideSchema = z.object({
  tag: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  desktopImage: z.string().min(1),
  mobileImage: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  textAlign: z.enum(["LEFT", "CENTER", "RIGHT"]),
  overlayOpacity: z.coerce.number().min(0).max(100),
  durationMs: z.coerce.number().min(1000),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveSlide(sliderId: string, id: string | null, formData: FormData) {
  await requireAdminAction("content", id ? "edit" : "create");
  const parsed = slideSchema.parse(Object.fromEntries(formData.entries()));
  const data = {
    sliderId,
    tag: parsed.tag || null,
    title: parsed.title || null,
    subtitle: parsed.subtitle || null,
    description: parsed.description || null,
    desktopImage: parsed.desktopImage,
    mobileImage: parsed.mobileImage || null,
    buttonText: parsed.buttonText || null,
    buttonUrl: parsed.buttonUrl || null,
    textAlign: parsed.textAlign,
    overlayOpacity: parsed.overlayOpacity,
    durationMs: parsed.durationMs,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    isActive: parsed.isActive ?? false,
  };

  if (id) {
    await prisma.sliderItem.update({ where: { id }, data });
  } else {
    const max = await prisma.sliderItem.aggregate({ where: { sliderId }, _max: { sortOrder: true } });
    await prisma.sliderItem.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  revalidatePath("/admin/sliders");
  revalidatePath("/", "layout");
}

export async function deleteSlide(id: string) {
  await requireAdminAction("content", "delete");
  await prisma.sliderItem.delete({ where: { id } });
  revalidatePath("/admin/sliders");
  revalidatePath("/", "layout");
}

export async function duplicateSlide(id: string) {
  await requireAdminAction("content", "create");
  const slide = await prisma.sliderItem.findUniqueOrThrow({ where: { id } });
  const max = await prisma.sliderItem.aggregate({ where: { sliderId: slide.sliderId }, _max: { sortOrder: true } });
  await prisma.sliderItem.create({
    data: {
      sliderId: slide.sliderId,
      tag: slide.tag,
      title: `${slide.title ?? ""} (Copy)`,
      subtitle: slide.subtitle,
      description: slide.description,
      desktopImage: slide.desktopImage,
      mobileImage: slide.mobileImage,
      buttonText: slide.buttonText,
      buttonUrl: slide.buttonUrl,
      textAlign: slide.textAlign,
      overlayOpacity: slide.overlayOpacity,
      durationMs: slide.durationMs,
      startDate: slide.startDate,
      endDate: slide.endDate,
      isActive: slide.isActive,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/admin/sliders");
  revalidatePath("/", "layout");
}

export async function moveSlide(id: string, direction: "up" | "down") {
  await requireAdminAction("content", "edit");
  const slide = await prisma.sliderItem.findUniqueOrThrow({ where: { id } });
  const slides = await prisma.sliderItem.findMany({ where: { sliderId: slide.sliderId }, orderBy: { sortOrder: "asc" } });
  const index = slides.findIndex((s) => s.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= slides.length) return;
  const a = slides[index]!;
  const b = slides[swapWith]!;
  await prisma.$transaction([
    prisma.sliderItem.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.sliderItem.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidatePath("/admin/sliders");
  revalidatePath("/", "layout");
}

export async function toggleSlide(id: string, isActive: boolean) {
  await requireAdminAction("content", "edit");
  await prisma.sliderItem.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/sliders");
  revalidatePath("/", "layout");
}
