"use client";

import { useState } from "react";
import type { Collection, Product, Category } from "@prisma/client";
import { saveCollection } from "@/actions/admin/collections";

type Rules = { categorySlug?: string; isFeatured?: boolean; isBestSeller?: boolean; isNewArrival?: boolean; isSale?: boolean };

export function CollectionForm({
  collection,
  products,
  categories,
  selectedProductIds,
}: {
  collection: Collection | null;
  products: Product[];
  categories: Category[];
  selectedProductIds: string[];
}) {
  const [type, setType] = useState(collection?.type ?? "MANUAL");
  const rules = (collection?.rules ?? {}) as Rules;
  const action = saveCollection.bind(null, collection?.id ?? null);

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input name="name" defaultValue={collection?.name} required className="input" />
        </div>
        <div>
          <label className="label">Slug (auto if blank)</label>
          <input name="slug" defaultValue={collection?.slug} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" defaultValue={collection?.description ?? ""} rows={3} className="input" />
      </div>
      <div>
        <label className="label">Image URL</label>
        <input name="imageUrl" defaultValue={collection?.imageUrl ?? ""} className="input" />
      </div>

      <div>
        <label className="label">Collection Type</label>
        <select name="type" value={type} onChange={(e) => setType(e.target.value as "MANUAL" | "AUTOMATIC")} className="input">
          <option value="MANUAL">Manual — I&apos;ll pick products</option>
          <option value="AUTOMATIC">Automatic — based on rules</option>
        </select>
      </div>

      {type === "MANUAL" ? (
        <div>
          <label className="label">Products</label>
          <select name="productIds" multiple defaultValue={selectedProductIds} className="input h-48">
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-noir/50">Hold Ctrl/Cmd to select multiple.</p>
        </div>
      ) : (
        <div className="space-y-3 border border-stone p-4">
          <div>
            <label className="label">Category</label>
            <select name="ruleCategorySlug" defaultValue={rules.categorySlug ?? ""} className="input">
              <option value="">— Any —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="ruleFeatured" defaultChecked={rules.isFeatured} className="accent-clay-600" /> Featured products
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="ruleBestSeller" defaultChecked={rules.isBestSeller} className="accent-clay-600" /> Best sellers
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="ruleNewArrival" defaultChecked={rules.isNewArrival} className="accent-clay-600" /> New arrivals
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="ruleSale" defaultChecked={rules.isSale} className="accent-clay-600" /> On sale
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">SEO Title</label>
          <input name="seoTitle" defaultValue={collection?.seoTitle ?? ""} className="input" />
        </div>
        <div>
          <label className="label">SEO Description</label>
          <input name="seoDescription" defaultValue={collection?.seoDescription ?? ""} className="input" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={collection?.isActive ?? true} className="accent-clay-600" />
        Published
      </label>

      <button type="submit" className="btn-primary">
        Save Collection
      </button>
    </form>
  );
}
