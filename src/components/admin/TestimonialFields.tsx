"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { ImageUploadField } from "./ImageUploadField";

/** Shared inputs for adding and editing a testimonial. */
export function TestimonialFields({ testimonial }: { testimonial?: Testimonial }) {
  const [rating, setRating] = useState(testimonial?.rating ?? 5);

  return (
    <>
      <div>
        <label className="label">Customer Name</label>
        <input name="name" required defaultValue={testimonial?.name ?? ""} className="input" />
      </div>
      <div>
        <label className="label">Stars</label>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
              <Star className={`h-6 w-6 ${n <= rating ? "fill-clay-500 text-clay-500" : "text-noir/20"}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Testimonial</label>
        <textarea name="content" required rows={3} defaultValue={testimonial?.content ?? ""} className="input" />
      </div>
      <ImageUploadField name="imageUrl" defaultValue={testimonial?.imageUrl ?? ""} label="Customer Photo (optional)" />
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={testimonial?.isActive ?? true} className="accent-clay-600" />
        Show on home page
      </label>
    </>
  );
}
