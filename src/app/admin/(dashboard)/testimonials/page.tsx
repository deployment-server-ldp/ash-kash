import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { TestimonialCard } from "@/components/admin/TestimonialCard";
import { AddTestimonialForm } from "@/components/admin/AddTestimonialForm";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  await requireAdmin("content");
  const testimonials = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Testimonials</h1>
          <p className="mt-1 text-sm text-noir/60">
            Testimonials marked &ldquo;On Home&rdquo; appear in the homepage Testimonials section, in this order.
          </p>
        </div>
        <AddTestimonialForm />
      </div>
      <div className="space-y-4">
        {testimonials.map((t, i) => (
          <TestimonialCard key={t.id} testimonial={t} isFirst={i === 0} isLast={i === testimonials.length - 1} />
        ))}
        {testimonials.length === 0 ? <p className="text-noir/50">No testimonials yet.</p> : null}
      </div>
    </div>
  );
}
