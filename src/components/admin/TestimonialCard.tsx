"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { deleteTestimonial, moveTestimonial, saveTestimonial, toggleTestimonial } from "@/actions/admin/testimonials";
import { ReorderButtons } from "./ReorderButtons";
import { DeleteButton } from "./DeleteButton";
import { TestimonialFields } from "./TestimonialFields";

export function TestimonialCard({ testimonial, isFirst, isLast }: { testimonial: Testimonial; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="border border-stone bg-ivory p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ReorderButtons
            onMoveUp={moveTestimonial.bind(null, testimonial.id, "up")}
            onMoveDown={moveTestimonial.bind(null, testimonial.id, "down")}
            disableUp={isFirst}
            disableDown={isLast}
          />
          {testimonial.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={testimonial.imageUrl} alt={testimonial.name} className="h-10 w-10 rounded-full object-cover" />
          ) : null}
          <div>
            <p className="font-medium">{testimonial.name}</p>
            <div className="my-1 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < testimonial.rating ? "fill-clay-500 text-clay-500" : "text-noir/20"}`} />
              ))}
            </div>
            <p className="line-clamp-2 text-sm text-noir/70">{testimonial.content}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs uppercase tracking-wide">
          <button
            disabled={pending}
            onClick={() => startTransition(async () => { await toggleTestimonial(testimonial.id, !testimonial.isActive); })}
            className={`underline ${testimonial.isActive ? "text-green-700" : "text-noir/50"}`}
          >
            {testimonial.isActive ? "On Home" : "Hidden"}
          </button>
          <button onClick={() => setEditing((v) => !v)} className="underline">
            {editing ? "Close" : "Edit"}
          </button>
          <DeleteButton action={deleteTestimonial.bind(null, testimonial.id)} />
        </div>
      </div>

      {editing ? (
        <form
          action={async (fd) => {
            await saveTestimonial(testimonial.id, fd);
            setEditing(false);
          }}
          className="mt-4 grid grid-cols-1 gap-3 border-t border-stone pt-4 sm:grid-cols-2"
        >
          <TestimonialFields testimonial={testimonial} />
          <button type="submit" className="btn-primary sm:col-span-2">
            Save Testimonial
          </button>
        </form>
      ) : null}
    </div>
  );
}
