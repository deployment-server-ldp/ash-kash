import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getOrCreateDefaultSlider } from "@/actions/admin/sliders";
import { SlideCard } from "@/components/admin/SlideCard";
import { AddSlideForm } from "@/components/admin/AddSlideForm";

export const metadata: Metadata = { title: "Sliders" };

export default async function AdminSlidersPage() {
  await requireAdmin("content");
  const slider = await getOrCreateDefaultSlider();
  const slides = await prisma.sliderItem.findMany({ where: { sliderId: slider.id }, orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Homepage Hero Slider</h1>
        <AddSlideForm sliderId={slider.id} />
      </div>
      <div className="space-y-4">
        {slides.map((s, i) => (
          <SlideCard key={s.id} sliderId={slider.id} slide={s} isFirst={i === 0} isLast={i === slides.length - 1} />
        ))}
        {slides.length === 0 ? <p className="text-noir/50">No slides yet.</p> : null}
      </div>
    </div>
  );
}
