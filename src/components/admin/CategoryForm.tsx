"use client";

import type { Category, SizeGuide } from "@prisma/client";
import { saveCategory } from "@/actions/admin/categories";

export function CategoryForm({
  category,
  categories,
  sizeGuides,
}: {
  category: Category | null;
  categories: Category[];
  sizeGuides: SizeGuide[];
}) {
  const action = saveCategory.bind(null, category?.id ?? null);

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input name="name" defaultValue={category?.name} required className="input" />
        </div>
        <div>
          <label className="label">Slug (auto if blank)</label>
          <input name="slug" defaultValue={category?.slug} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" defaultValue={category?.description ?? ""} rows={3} className="input" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Image URL</label>
          <input name="imageUrl" defaultValue={category?.imageUrl ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Banner URL</label>
          <input name="bannerUrl" defaultValue={category?.bannerUrl ?? ""} className="input" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Parent Category</label>
          <select name="parentId" defaultValue={category?.parentId ?? ""} className="input">
            <option value="">— None (top level) —</option>
            {categories
              .filter((c) => c.id !== category?.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="label">Size Guide</label>
          <select name="sizeGuideId" defaultValue={category?.sizeGuideId ?? ""} className="input">
            <option value="">— None —</option>
            {sizeGuides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">SEO Title</label>
          <input name="seoTitle" defaultValue={category?.seoTitle ?? ""} className="input" />
        </div>
        <div>
          <label className="label">SEO Description</label>
          <input name="seoDescription" defaultValue={category?.seoDescription ?? ""} className="input" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={category?.isActive ?? true} className="accent-clay-600" />
        Active (visible on storefront)
      </label>
      <button type="submit" className="btn-primary">
        Save Category
      </button>
    </form>
  );
}
