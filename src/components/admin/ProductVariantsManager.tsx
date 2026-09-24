"use client";

import { useState, useTransition } from "react";
import type { ProductVariant, Size, Color } from "@prisma/client";
import { addVariantsForColor, deleteVariant, saveVariant } from "@/actions/admin/products";
import { DeleteButton } from "./DeleteButton";

type VariantWithRefs = ProductVariant & { size: Size | null; color: Color | null };

export function ProductVariantsManager({
  productId,
  variants,
  sizes,
  colors,
}: {
  productId: string;
  variants: VariantWithRefs[];
  sizes: Size[];
  colors: Color[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);

  return (
    <div>
      {variants.length > 0 ? (
        <div className="overflow-x-auto border border-stone">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone bg-stone/40 text-left">
                <th className="p-3">Variant</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Active</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <VariantRow key={v.id} variant={v} sizes={sizes} colors={colors} productId={productId} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-noir/50">No variants yet. Add some below, or leave empty for a single-SKU product.</p>
      )}

      {showBulkForm ? (
        <div className="mt-4 border border-stone p-4">
          <BulkColorSizeForm productId={productId} sizes={sizes} colors={colors} onDone={() => setShowBulkForm(false)} />
        </div>
      ) : (
        <button onClick={() => setShowBulkForm(true)} className="btn-primary mt-4">
          Add Sizes for a Color
        </button>
      )}

      {showForm ? (
        <div className="mt-4 border border-stone p-4">
          <VariantForm productId={productId} sizes={sizes} colors={colors} onDone={() => setShowForm(false)} />
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-outline mt-4">
          Add Single Variant
        </button>
      )}
    </div>
  );
}

/** Pick one color, tick every size it comes in, and create all those variants in one go —
 * instead of adding each size/color combination one at a time. */
function BulkColorSizeForm({
  productId,
  sizes,
  colors,
  onDone,
}: {
  productId: string;
  sizes: Size[];
  colors: Color[];
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await addVariantsForColor(productId, formData);
          if (result.error) {
            setError(result.error);
            return;
          }
          onDone();
        });
      }}
      className="space-y-4"
    >
      <div className="max-w-xs">
        <label className="label">Color</label>
        <select name="colorId" required className="input">
          <option value="">— Select color —</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Sizes available in this color</label>
        <div className="flex flex-wrap gap-3">
          {sizes.map((s) => (
            <label key={s.id} className="flex items-center gap-1.5 border border-stone px-3 py-1.5 text-sm">
              <input type="checkbox" name="sizeIds" value={s.id} className="accent-clay-600" />
              {s.name}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
        <div>
          <label className="label">Stock (each size)</label>
          <input type="number" name="inventoryQuantity" defaultValue={0} className="input" />
        </div>
        <div>
          <label className="label">Price override (optional)</label>
          <input type="number" step="0.01" name="price" className="input" />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Adding…" : "Add Variants"}
        </button>
        <button type="button" onClick={onDone} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

function VariantRow({
  variant,
  sizes,
  colors,
  productId,
}: {
  variant: VariantWithRefs;
  sizes: Size[];
  colors: Color[];
  productId: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr>
        <td colSpan={6} className="p-4">
          <VariantForm productId={productId} variant={variant} sizes={sizes} colors={colors} onDone={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-stone/60">
      <td className="p-3">{variant.title ?? "—"}</td>
      <td className="p-3">{variant.sku}</td>
      <td className="p-3">{variant.price ? Number(variant.price).toFixed(2) : "Base price"}</td>
      <td className="p-3">{variant.inventoryQuantity}</td>
      <td className="p-3">{variant.isActive ? "Yes" : "No"}</td>
      <td className="p-3">
        <div className="flex justify-end gap-3">
          <button onClick={() => setEditing(true)} className="text-xs uppercase tracking-wide underline">
            Edit
          </button>
          <DeleteButton action={deleteVariant.bind(null, variant.id, productId)} />
        </div>
      </td>
    </tr>
  );
}

function VariantForm({
  productId,
  variant,
  sizes,
  colors,
  onDone,
}: {
  productId: string;
  variant?: VariantWithRefs;
  sizes: Size[];
  colors: Color[];
  onDone: () => void;
}) {
  const action = saveVariant.bind(null, productId, variant?.id ?? null);

  return (
    <form
      action={async (formData) => {
        await action(formData);
        onDone();
      }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <div>
        <label className="label">Size</label>
        <select name="sizeId" defaultValue={variant?.sizeId ?? ""} className="input">
          <option value="">—</option>
          {sizes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Color</label>
        <select name="colorId" defaultValue={variant?.colorId ?? ""} className="input">
          <option value="">—</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">SKU</label>
        <input name="sku" defaultValue={variant?.sku} required className="input" />
      </div>
      <div>
        <label className="label">Stock</label>
        <input type="number" name="inventoryQuantity" defaultValue={variant?.inventoryQuantity ?? 0} className="input" />
      </div>
      <div>
        <label className="label">Price (optional override)</label>
        <input type="number" step="0.01" name="price" defaultValue={variant?.price?.toString() ?? ""} className="input" />
      </div>
      <div>
        <label className="label">Compare-at Price</label>
        <input type="number" step="0.01" name="compareAtPrice" defaultValue={variant?.compareAtPrice?.toString() ?? ""} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Image URL</label>
        <input name="imageUrl" defaultValue={variant?.imageUrl ?? ""} className="input" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={variant?.isActive ?? true} className="accent-clay-600" />
        Active
      </label>
      <div className="col-span-full flex gap-2">
        <button type="submit" className="btn-primary">
          Save Variant
        </button>
        <button type="button" onClick={onDone} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
