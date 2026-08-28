import { Star } from "lucide-react";
import type { HomepageSection, Testimonial } from "@prisma/client";

export function Testimonials({ section, testimonials }: { section: HomepageSection; testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-stone py-16 sm:py-24">
      <div className="container-boutique">
        {section.title ? (
          <div className="mb-10 text-center">
            {section.subtitle ? <p className="eyebrow mb-2">{section.subtitle}</p> : null}
            <h2 className="font-display text-3xl sm:text-4xl">{section.title}</h2>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-ivory p-6 text-center">
              <div className="mb-3 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-clay-500 text-clay-500" : "text-stone"}`} />
                ))}
              </div>
              <p className="text-sm text-noir/70">&ldquo;{t.content}&rdquo;</p>
              <p className="mt-4 font-display">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
