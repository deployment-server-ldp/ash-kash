"use client";

import type { BlogPost, BlogCategory } from "@prisma/client";
import { saveBlogPost } from "@/actions/admin/blog";
import { ImageUploadField } from "./ImageUploadField";

export function BlogPostForm({ post, categories }: { post: BlogPost | null; categories: BlogCategory[] }) {
  const action = saveBlogPost.bind(null, post?.id ?? null);
  return (
    <form action={action} className="max-w-3xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Title</label>
          <input name="title" defaultValue={post?.title} required className="input" />
        </div>
        <div>
          <label className="label">Slug (auto if blank)</label>
          <input name="slug" defaultValue={post?.slug} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Category</label>
        <select name="categoryId" defaultValue={post?.categoryId ?? ""} className="input max-w-xs">
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <ImageUploadField name="featuredImage" defaultValue={post?.featuredImage} label="Featured Image" />
      <div>
        <label className="label">Excerpt</label>
        <textarea name="excerpt" defaultValue={post?.excerpt ?? ""} rows={2} className="input" />
      </div>
      <div>
        <label className="label">Content (HTML)</label>
        <textarea name="content" defaultValue={post?.content ?? ""} rows={14} required className="input font-mono text-xs" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">SEO Title</label>
          <input name="seoTitle" defaultValue={post?.seoTitle ?? ""} className="input" />
        </div>
        <div>
          <label className="label">SEO Description</label>
          <input name="seoDescription" defaultValue={post?.seoDescription ?? ""} className="input" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" value="true" defaultChecked={post?.isPublished} className="accent-clay-600" />
        Published
      </label>
      <button type="submit" className="btn-primary">
        Save Post
      </button>
    </form>
  );
}
