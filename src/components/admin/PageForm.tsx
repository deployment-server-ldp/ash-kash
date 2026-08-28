"use client";

import type { Page } from "@prisma/client";
import { savePage } from "@/actions/admin/pages";

export function PageForm({ page }: { page: Page | null }) {
  const action = savePage.bind(null, page?.id ?? null);
  return (
    <form action={action} className="max-w-3xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Title</label>
          <input name="title" defaultValue={page?.title} required className="input" />
        </div>
        <div>
          <label className="label">Slug (auto if blank)</label>
          <input name="slug" defaultValue={page?.slug} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Content (HTML)</label>
        <textarea name="content" defaultValue={page?.content ?? ""} rows={12} className="input font-mono text-xs" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">SEO Title</label>
          <input name="seoTitle" defaultValue={page?.seoTitle ?? ""} className="input" />
        </div>
        <div>
          <label className="label">SEO Keywords</label>
          <input name="seoKeywords" defaultValue={page?.seoKeywords ?? ""} className="input" />
        </div>
      </div>
      <div>
        <label className="label">SEO Description</label>
        <textarea name="seoDescription" defaultValue={page?.seoDescription ?? ""} rows={2} className="input" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" value="true" defaultChecked={page?.isPublished ?? true} className="accent-clay-600" />
        Published
      </label>
      <button type="submit" className="btn-primary">
        Save Page
      </button>
    </form>
  );
}
