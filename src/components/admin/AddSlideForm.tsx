"use client";

import { useState } from "react";
import { saveSlide } from "@/actions/admin/sliders";
import { ImageUploadField } from "./ImageUploadField";

export function AddSlideForm({ sliderId }: { sliderId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        Add Slide
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await saveSlide(sliderId, null, fd);
        setOpen(false);
      }}
      className="grid grid-cols-1 gap-3 border border-stone bg-ivory p-5 sm:grid-cols-2"
    >
      <div>
        <label className="label">Title</label>
        <input name="title" className="input" />
      </div>
      <div>
        <label className="label">Subtitle</label>
        <input name="subtitle" className="input" />
      </div>
      <ImageUploadField name="desktopImage" label="Desktop Image (required)" />
      <ImageUploadField name="mobileImage" label="Mobile Image (optional)" />
      <input type="hidden" name="textAlign" value="LEFT" />
      <input type="hidden" name="overlayOpacity" value="20" />
      <input type="hidden" name="durationMs" value="6000" />
      <input type="hidden" name="isActive" value="true" />
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn-primary">
          Save Slide
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
