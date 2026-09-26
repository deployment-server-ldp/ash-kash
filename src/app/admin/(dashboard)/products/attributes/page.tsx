import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  createBrand,
  createColor,
  createSize,
  createSizeGuide,
  createTag,
  deleteBrand,
  deleteColor,
  deleteSize,
  deleteSizeGuide,
  deleteTag,
} from "@/actions/admin/attributes";

export const metadata: Metadata = { title: "Product Attributes" };

export default async function ProductAttributesPage() {
  await requireAdmin("products", "create");
  const [sizes, colors, brands, tags, sizeGuides] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.color.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.sizeGuide.findMany({ include: { _count: { select: { rows: true } } }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Product Attributes</h1>
      <p className="mb-8 text-sm text-noir/60">
        Manage the sizes, colors, brands, tags, and size guides available when building products and variants.
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Sizes</h2>
          <ul className="mb-4 space-y-2">
            {sizes.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                {s.name}
                <DeleteButton action={deleteSize.bind(null, s.id)} />
              </li>
            ))}
          </ul>
          <form action={createSize} className="flex gap-2">
            <input name="name" placeholder="e.g. XL" required className="input" />
            <button type="submit" className="btn-outline shrink-0">
              Add
            </button>
          </form>
        </div>

        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Colors</h2>
          <ul className="mb-4 space-y-2">
            {colors.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border border-stone" style={{ backgroundColor: c.hexValue ?? "#ccc" }} />
                  {c.name}
                </span>
                <DeleteButton action={deleteColor.bind(null, c.id)} />
              </li>
            ))}
          </ul>
          <form action={createColor} className="flex gap-2">
            <input name="name" placeholder="e.g. Emerald" required className="input" />
            <input type="color" name="hexValue" className="h-10 w-12 border border-stone" />
            <button type="submit" className="btn-outline shrink-0">
              Add
            </button>
          </form>
        </div>

        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Brands</h2>
          <ul className="mb-4 space-y-2">
            {brands.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                {b.name}
                <DeleteButton action={deleteBrand.bind(null, b.id)} />
              </li>
            ))}
          </ul>
          <form action={createBrand} className="flex gap-2">
            <input name="name" placeholder="Brand name" required className="input" />
            <button type="submit" className="btn-outline shrink-0">
              Add
            </button>
          </form>
        </div>

        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Tags</h2>
          <ul className="mb-4 space-y-2">
            {tags.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                {t.name}
                <DeleteButton action={deleteTag.bind(null, t.id)} />
              </li>
            ))}
          </ul>
          <form action={createTag} className="flex gap-2">
            <input name="name" placeholder="Tag name" required className="input" />
            <button type="submit" className="btn-outline shrink-0">
              Add
            </button>
          </form>
        </div>

        <div className="border border-stone bg-ivory p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg">Size Guides</h2>
          <ul className="mb-4 space-y-2">
            {sizeGuides.map((g) => (
              <li key={g.id} className="flex items-center justify-between text-sm">
                <span>
                  {g.title} ({g._count.rows} sizes){g.imageUrl ? " · has image" : ""}
                </span>
                <span className="flex items-center gap-3">
                  <Link href={`/admin/products/attributes/size-guides/${g.id}`} className="underline">
                    Edit
                  </Link>
                  <DeleteButton action={deleteSizeGuide.bind(null, g.id)} />
                </span>
              </li>
            ))}
          </ul>
          <form action={createSizeGuide} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input name="title" placeholder="Guide title, e.g. Women's Apparel" required className="input" />
            <select name="unit" className="input">
              <option value="in">Inches</option>
              <option value="cm">Centimeters</option>
            </select>
            <div className="sm:col-span-2">
              <ImageUploadField name="imageUrl" label="Size Chart Image (optional — for an image-only guide, leave the fields below blank)" />
            </div>
            <input name="sizeNames" placeholder="Sizes, comma separated: XS, S, M, L, XL (optional if using an image)" className="input sm:col-span-2" />
            <input
              name="measurementKeys"
              placeholder="Measurements, comma separated: Bust, Waist, Hip (optional if using an image)"
              className="input sm:col-span-2"
            />
            <textarea name="instructions" placeholder="Instructions (optional)" className="input sm:col-span-2" />
            <button type="submit" className="btn-outline sm:col-span-2">
              Create Size Guide
            </button>
          </form>
          <p className="mt-2 text-xs text-noir/50">
            If you filled in sizes/measurements, edit the guide afterwards to enter each size&apos;s actual values.
          </p>
        </div>
      </div>
    </div>
  );
}
