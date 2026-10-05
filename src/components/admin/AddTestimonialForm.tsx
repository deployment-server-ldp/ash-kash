"use client";

import { useState } from "react";
import { saveTestimonial } from "@/actions/admin/testimonials";
import { TestimonialFields } from "./TestimonialFields";

export function AddTestimonialForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        Add Testimonial
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await saveTestimonial(null, fd);
        setOpen(false);
      }}
      className="grid grid-cols-1 gap-3 border border-stone bg-ivory p-5 sm:grid-cols-2"
    >
      <TestimonialFields />
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn-primary">
          Save Testimonial
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
