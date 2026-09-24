"use client";

import { useState, useTransition } from "react";
import type { HomepageSection, Product } from "@prisma/client";
import { deleteHomepageSection, moveHomepageSection, toggleHomepageSection, updateHomepageSection } from "@/actions/admin/content";
import { ReorderButtons } from "./ReorderButtons";
import { DeleteButton } from "./DeleteButton";
import { ImageUploadField } from "./ImageUploadField";

const NEEDS_PRODUCT_SOURCE: string[] = ["FEATURED_PRODUCTS", "NEW_ARRIVALS", "BEST_SELLERS"];

export function HomepageSectionCard({
  section,
  products,
  isFirst,
  isLast,
}: {
  section: HomepageSection;
  products: Product[];
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const settings = (section.settings ?? {}) as { source?: string; limit?: number; productIds?: string[] };

  return (
    <div className="border border-stone bg-ivory p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ReorderButtons
            onMoveUp={moveHomepageSection.bind(null, section.id, "up")}
            onMoveDown={moveHomepageSection.bind(null, section.id, "down")}
            disableUp={isFirst}
            disableDown={isLast}
          />
          <div>
            <p className="text-xs uppercase tracking-wide text-noir/50">{section.type.replace(/_/g, " ")}</p>
            <p className="font-medium">{section.title || "(untitled)"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide">
          <button
            disabled={pending}
            onClick={() => startTransition(async () => { await toggleHomepageSection(section.id, !section.isActive); })}
            className={section.isActive ? "text-clay-600 underline" : "text-noir/50 underline"}
          >
            {section.isActive ? "Enabled" : "Disabled"}
          </button>
          <button onClick={() => setEditing((v) => !v)} className="underline">
            {editing ? "Close" : "Edit"}
          </button>
          <DeleteButton action={deleteHomepageSection.bind(null, section.id)} />
        </div>
      </div>

      {editing ? (
        <form action={updateHomepageSection.bind(null, section.id)} className="grid grid-cols-1 gap-3 border-t border-stone pt-4 sm:grid-cols-2">
          <input type="hidden" name="type" value={section.type} />
          <div>
            <label className="label">Title</label>
            <input name="title" defaultValue={section.title ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input name="subtitle" defaultValue={section.subtitle ?? ""} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Content / Description</label>
            <textarea name="content" defaultValue={section.content ?? ""} rows={2} className="input" />
          </div>
          <div>
            <ImageUploadField name="imageUrl" defaultValue={section.imageUrl} label="Image" />
          </div>
          {section.type === "PROMO_BANNER" ? (
            <div>
              <ImageUploadField
                name="imageUrl2"
                defaultValue={section.imageUrl2}
                label="Second Image (optional — set to show a 2-column grid of two square banners instead of one)"
              />
            </div>
          ) : null}
          <div>
            <label className="label">Button Text</label>
            <input name="buttonText" defaultValue={section.buttonText ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Button URL</label>
            <input name="buttonUrl" defaultValue={section.buttonUrl ?? ""} className="input" />
            <p className="mt-1 text-[11px] text-noir/50">
              If Button Text is left blank, the whole banner image becomes clickable to this URL instead.
            </p>
          </div>
          {NEEDS_PRODUCT_SOURCE.includes(section.type) ? (
            <>
              <div>
                <label className="label">Product Source</label>
                <select name="source" defaultValue={settings.source ?? "latest"} className="input">
                  <option value="latest">Latest</option>
                  <option value="featured">Featured</option>
                  <option value="best_seller">Best Sellers</option>
                  <option value="new_arrival">New Arrivals</option>
                  <option value="sale">On Sale</option>
                  <option value="custom">Custom Selection</option>
                </select>
              </div>
              <div>
                <label className="label">Limit</label>
                <input type="number" name="limit" defaultValue={settings.limit ?? 8} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Custom Products (used when source = Custom)</label>
                <select name="productIds" multiple defaultValue={settings.productIds ?? []} className="input h-32">
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
          <input type="hidden" name="isActive" value={section.isActive ? "true" : ""} />
          <button type="submit" className="btn-primary sm:col-span-2">
            Save Section
          </button>
        </form>
      ) : null}
    </div>
  );
}
