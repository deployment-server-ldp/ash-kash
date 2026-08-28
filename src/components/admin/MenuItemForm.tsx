"use client";

import { useState } from "react";
import type { MenuItem, Category, Collection, Product, Page } from "@prisma/client";
import { saveMenuItem } from "@/actions/admin/navigation";

export function MenuItemForm({
  menuId,
  item,
  parentId,
  categories,
  collections,
  products,
  pages,
  onDone,
}: {
  menuId: string;
  item?: MenuItem;
  parentId?: string;
  categories: Category[];
  collections: Collection[];
  products: Product[];
  pages: Page[];
  onDone: () => void;
}) {
  const [type, setType] = useState(item?.type ?? "CUSTOM");
  const action = saveMenuItem.bind(null, menuId, item?.id ?? null);

  return (
    <form
      action={async (fd) => {
        await action(fd);
        onDone();
      }}
      className="grid grid-cols-2 gap-3 border border-stone p-4 sm:grid-cols-4"
    >
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <input name="label" defaultValue={item?.label} placeholder="Label" required className="input" />
      <select name="type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="input">
        <option value="CUSTOM">Custom URL</option>
        <option value="CATEGORY">Category</option>
        <option value="COLLECTION">Collection</option>
        <option value="PRODUCT">Product</option>
        <option value="PAGE">Page</option>
      </select>
      {type === "CUSTOM" ? <input name="url" defaultValue={item?.url ?? ""} placeholder="/shop or https://..." className="input" /> : null}
      {type === "CATEGORY" ? (
        <select name="categoryId" defaultValue={item?.categoryId ?? ""} className="input">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ) : null}
      {type === "COLLECTION" ? (
        <select name="collectionId" defaultValue={item?.collectionId ?? ""} className="input">
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ) : null}
      {type === "PRODUCT" ? (
        <select name="productId" defaultValue={item?.productId ?? ""} className="input">
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ) : null}
      {type === "PAGE" ? (
        <select name="pageId" defaultValue={item?.pageId ?? ""} className="input">
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={item?.isActive ?? true} className="accent-clay-600" />
        Active
      </label>
      <div className="col-span-full flex gap-2">
        <button type="submit" className="btn-primary">
          Save
        </button>
        <button type="button" onClick={onDone} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
