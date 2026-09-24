"use client";

import { useState } from "react";
import { createHomepageSection } from "@/actions/admin/content";

const TYPES: { value: string; label: string }[] = [
  { value: "HERO_SLIDER", label: "Hero Slider" },
  { value: "FEATURED_CATEGORIES", label: "Featured Categories" },
  { value: "NEW_ARRIVALS", label: "New Arrivals" },
  { value: "FEATURED_PRODUCTS", label: "Featured Products" },
  { value: "PROMO_BANNER", label: "Promotional Banner" },
  { value: "BEST_SELLERS", label: "Best Sellers" },
  { value: "COLLECTION_SHOWCASE", label: "Collection Showcase" },
  { value: "BRAND_STORY", label: "Brand Story" },
  { value: "TESTIMONIALS", label: "Testimonials" },
  { value: "INSTAGRAM", label: "Instagram / Social Gallery" },
  { value: "NEWSLETTER", label: "Newsletter" },
];

export function AddHomepageSectionForm({ pageId = null }: { pageId?: string | null } = {}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        Add Section
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createHomepageSection(pageId, fd);
        setOpen(false);
      }}
      className="flex gap-2"
    >
      <select name="type" required className="input">
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input type="hidden" name="isActive" value="true" />
      <button type="submit" className="btn-primary">
        Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
        Cancel
      </button>
    </form>
  );
}
