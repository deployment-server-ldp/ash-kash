import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/data/settings";
import { requireAdmin } from "@/lib/auth/guards";
import { updateSeoDefaults } from "@/actions/admin/settings";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export const metadata: Metadata = { title: "SEO" };

export default async function AdminSeoPage() {
  await requireAdmin("seo");
  const settings = await getStoreSettings();

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-3xl">SEO</h1>

      <section className="border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Site-wide Defaults</h2>
        <p className="mb-4 text-sm text-noir/60">
          Used as a fallback whenever a product, category, collection, page, or blog post doesn&apos;t define its own
          SEO title/description. Per-item SEO fields are managed directly on that item&apos;s edit page.
        </p>
        <form action={updateSeoDefaults} className="space-y-4">
          <div>
            <label className="label">Default SEO Title</label>
            <input name="seoDefaultTitle" defaultValue={settings.seoDefaultTitle ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Default Meta Description</label>
            <textarea name="seoDefaultDescription" defaultValue={settings.seoDefaultDescription ?? ""} rows={2} className="input" />
          </div>
          <div>
            <label className="label">Default Keywords</label>
            <input name="seoDefaultKeywords" defaultValue={settings.seoDefaultKeywords ?? ""} className="input" />
          </div>
          <ImageUploadField name="seoDefaultOgImage" defaultValue={settings.seoDefaultOgImage} label="Default Open Graph Image" />
          <button type="submit" className="btn-primary">
            Save
          </button>
        </form>
      </section>

      <section className="border border-stone bg-ivory p-6 text-sm text-noir/70">
        <h2 className="mb-2 font-display text-lg text-noir">Sitemap &amp; Robots</h2>
        <p>
          <a href="/sitemap.xml" target="_blank" className="underline">
            /sitemap.xml
          </a>{" "}
          and{" "}
          <a href="/robots.txt" target="_blank" className="underline">
            /robots.txt
          </a>{" "}
          are generated automatically from your active products, categories, collections, pages, and blog posts.
        </p>
      </section>
    </div>
  );
}
