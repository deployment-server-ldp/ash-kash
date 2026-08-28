"use client";

import { useState } from "react";
import { adjustInventory } from "@/actions/admin/inventory";

export function InventoryAdjustForm({ productId, variantId }: { productId: string; variantId?: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs uppercase tracking-wide underline">
        Adjust Stock
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await adjustInventory(formData);
        setOpen(false);
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="productId" value={productId} />
      {variantId ? <input type="hidden" name="variantId" value={variantId} /> : null}
      <input type="number" name="adjustment" placeholder="+/- qty" required className="input w-24 px-2 py-1 text-xs" />
      <input type="text" name="note" placeholder="Note" className="input w-32 px-2 py-1 text-xs" />
      <button type="submit" className="btn-outline px-2 py-1 text-xs">
        Save
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-noir/50">
        Cancel
      </button>
    </form>
  );
}
