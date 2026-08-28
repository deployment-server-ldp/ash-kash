"use client";

import { useState } from "react";
import type { Product, Category, Brand, Tag, SizeGuide, Collection } from "@prisma/client";
import { saveProduct } from "@/actions/admin/products";

export function ProductForm({
  product,
  categories,
  brands,
  tags,
  sizeGuides,
  collections,
  selectedTagIds,
  selectedCollectionIds,
}: {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  tags: Tag[];
  sizeGuides: SizeGuide[];
  collections: Collection[];
  selectedTagIds: string[];
  selectedCollectionIds: string[];
}) {
  const [trackInventory, setTrackInventory] = useState(product?.trackInventory ?? true);
  const action = saveProduct.bind(null, product?.id ?? null);

  return (
    <form action={action} className="space-y-10">
      <section className="border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">General</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Product Name</label>
            <input name="name" defaultValue={product?.name} required className="input" />
          </div>
          <div>
            <label className="label">Slug (auto if blank)</label>
            <input name="slug" defaultValue={product?.slug} className="input" />
          </div>
          <div>
            <label className="label">SKU</label>
            <input name="sku" defaultValue={product?.sku} required className="input" />
          </div>
          <div>
            <label className="label">Product Type</label>
            <input name="productType" defaultValue={product?.productType ?? ""} placeholder="e.g. Dress, Blouse" className="input" />
          </div>
          <div>
            <label className="label">Category</label>
            <select name="categoryId" defaultValue={product?.categoryId ?? ""} className="input">
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Brand</label>
            <select name="brandId" defaultValue={product?.brandId ?? ""} className="input">
              <option value="">— None —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Size Guide</label>
            <select name="sizeGuideId" defaultValue={product?.sizeGuideId ?? ""} className="input">
              <option value="">— None —</option>
              {sizeGuides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Video URL</label>
            <input name="videoUrl" defaultValue={product?.videoUrl ?? ""} className="input" />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Short Description</label>
          <textarea name="shortDescription" defaultValue={product?.shortDescription ?? ""} rows={2} className="input" />
        </div>
        <div className="mt-4">
          <label className="label">Full Description</label>
          <textarea name="description" defaultValue={product?.description ?? ""} rows={6} className="input" />
        </div>
        <div className="mt-4">
          <label className="label">Tags</label>
          <select name="tagIds" multiple defaultValue={selectedTagIds} className="input h-28">
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <label className="label">Collections</label>
          <select name="collectionIds" multiple defaultValue={selectedCollectionIds} className="input h-28">
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Pricing &amp; Inventory</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Price</label>
            <input type="number" step="0.01" name="price" defaultValue={product?.price?.toString()} required className="input" />
          </div>
          <div>
            <label className="label">Compare-at Price</label>
            <input type="number" step="0.01" name="compareAtPrice" defaultValue={product?.compareAtPrice?.toString() ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Cost Price</label>
            <input type="number" step="0.01" name="costPrice" defaultValue={product?.costPrice?.toString() ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Tax Rate (%)</label>
            <input type="number" step="0.01" name="taxRate" defaultValue={product?.taxRate?.toString() ?? "0"} className="input" />
          </div>
          <div>
            <label className="label">Low Stock Threshold</label>
            <input type="number" name="lowStockThreshold" defaultValue={product?.lowStockThreshold ?? 5} className="input" />
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input type="number" step="0.01" name="weight" defaultValue={product?.weight?.toString() ?? ""} className="input" />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="trackInventory"
            value="true"
            checked={trackInventory}
            onChange={(e) => setTrackInventory(e.target.checked)}
            className="accent-clay-600"
          />
          Track inventory for this product
        </label>
        {trackInventory ? (
          <div className="mt-4 max-w-xs">
            <label className="label">Inventory Quantity</label>
            <input type="number" name="inventoryQuantity" defaultValue={product?.inventoryQuantity ?? 0} className="input" />
            <p className="mt-1 text-xs text-noir/50">Ignored once this product has variants — manage stock per variant instead.</p>
          </div>
        ) : null}
      </section>

      <section className="border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Merchandising</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFeatured" value="true" defaultChecked={product?.isFeatured} className="accent-clay-600" /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isNewArrival" value="true" defaultChecked={product?.isNewArrival} className="accent-clay-600" /> New Arrival
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isBestSeller" value="true" defaultChecked={product?.isBestSeller} className="accent-clay-600" /> Best Seller
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isSale" value="true" defaultChecked={product?.isSale} className="accent-clay-600" /> On Sale
          </label>
        </div>
        <div className="mt-4 max-w-xs">
          <label className="label">Custom Badge Text</label>
          <input name="badge" defaultValue={product?.badge ?? ""} placeholder="e.g. LIMITED, TRENDING" className="input" />
        </div>
        <div className="mt-4 max-w-xs">
          <label className="label">Status</label>
          <select name="status" defaultValue={product?.status ?? "DRAFT"} className="input">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active (published)</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </section>

      <section className="border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className="label">SEO Title</label>
            <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} className="input" />
          </div>
          <div>
            <label className="label">SEO Description</label>
            <textarea name="seoDescription" defaultValue={product?.seoDescription ?? ""} rows={2} className="input" />
          </div>
          <div>
            <label className="label">SEO Keywords</label>
            <input name="seoKeywords" defaultValue={product?.seoKeywords ?? ""} className="input" />
          </div>
        </div>
      </section>

      <button type="submit" className="btn-primary">
        Save Product
      </button>
    </form>
  );
}
