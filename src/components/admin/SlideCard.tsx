"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { SliderItem } from "@prisma/client";
import { deleteSlide, duplicateSlide, moveSlide, saveSlide, toggleSlide } from "@/actions/admin/sliders";
import { ReorderButtons } from "./ReorderButtons";
import { DeleteButton } from "./DeleteButton";
import { ImageUploadField } from "./ImageUploadField";

export function SlideCard({ sliderId, slide, isFirst, isLast }: { sliderId: string; slide: SliderItem; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function toInputDate(d: Date | null) {
    return d ? new Date(d).toISOString().slice(0, 16) : "";
  }

  return (
    <div className="border border-stone bg-ivory p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ReorderButtons
            onMoveUp={moveSlide.bind(null, slide.id, "up")}
            onMoveDown={moveSlide.bind(null, slide.id, "down")}
            disableUp={isFirst}
            disableDown={isLast}
          />
          <div className="relative h-12 w-20 overflow-hidden bg-stone">
            <Image src={slide.desktopImage} alt={slide.title ?? ""} fill className="object-cover" />
          </div>
          <p className="font-medium">{slide.title || "(untitled slide)"}</p>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide">
          <button disabled={pending} onClick={() => startTransition(async () => { await toggleSlide(slide.id, !slide.isActive); })} className="underline">
            {slide.isActive ? "Active" : "Inactive"}
          </button>
          <button onClick={() => setEditing((v) => !v)} className="underline">
            {editing ? "Close" : "Edit"}
          </button>
          <button disabled={pending} onClick={() => startTransition(async () => { await duplicateSlide(slide.id); })} className="underline">
            Duplicate
          </button>
          <DeleteButton action={deleteSlide.bind(null, slide.id)} />
        </div>
      </div>

      {editing ? (
        <form action={saveSlide.bind(null, sliderId, slide.id)} className="grid grid-cols-1 gap-3 border-t border-stone pt-4 sm:grid-cols-2">
          <div>
            <label className="label">Tag / Badge</label>
            <input name="tag" defaultValue={slide.tag ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Title</label>
            <input name="title" defaultValue={slide.title ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input name="subtitle" defaultValue={slide.subtitle ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Text Alignment</label>
            <select name="textAlign" defaultValue={slide.textAlign} className="input">
              <option value="LEFT">Left</option>
              <option value="CENTER">Center</option>
              <option value="RIGHT">Right</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea name="description" defaultValue={slide.description ?? ""} rows={2} className="input" />
          </div>
          <ImageUploadField name="desktopImage" defaultValue={slide.desktopImage} label="Desktop Image" />
          <ImageUploadField name="mobileImage" defaultValue={slide.mobileImage ?? ""} label="Mobile Image" />
          <div>
            <label className="label">Button Text</label>
            <input name="buttonText" defaultValue={slide.buttonText ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Button URL</label>
            <input name="buttonUrl" defaultValue={slide.buttonUrl ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Overlay Opacity (%)</label>
            <input type="number" name="overlayOpacity" defaultValue={slide.overlayOpacity} min={0} max={100} className="input" />
          </div>
          <div>
            <label className="label">Slide Duration (ms)</label>
            <input type="number" name="durationMs" defaultValue={slide.durationMs} min={1000} step={500} className="input" />
          </div>
          <div>
            <label className="label">Start Date (optional)</label>
            <input type="datetime-local" name="startDate" defaultValue={toInputDate(slide.startDate)} className="input" />
          </div>
          <div>
            <label className="label">End Date (optional)</label>
            <input type="datetime-local" name="endDate" defaultValue={toInputDate(slide.endDate)} className="input" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" value="true" defaultChecked={slide.isActive} className="accent-clay-600" />
            Active
          </label>
          <button type="submit" className="btn-primary sm:col-span-2">
            Save Slide
          </button>
        </form>
      ) : null}
    </div>
  );
}
