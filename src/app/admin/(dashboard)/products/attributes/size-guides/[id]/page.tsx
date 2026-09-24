import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { updateSizeGuideDetails, updateSizeGuideRows } from "@/actions/admin/attributes";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export const metadata: Metadata = { title: "Edit Size Guide" };

export default async function EditSizeGuidePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("products", "edit");
  const { id } = await params;
  const guide = await prisma.sizeGuide.findUnique({ where: { id }, include: { rows: { orderBy: { position: "asc" } } } });
  if (!guide) notFound();

  const measurementKeys = guide.rows.length > 0 ? Object.keys(guide.rows[0]!.measurements as Record<string, string>) : [];
  const updateDetails = updateSizeGuideDetails.bind(null, guide.id);
  const updateRows = updateSizeGuideRows.bind(null, guide.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Edit Size Guide</h1>
        <Link href="/admin/products/attributes" className="text-sm underline">
          Back to Attributes
        </Link>
      </div>

      <section className="mb-10 border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Details</h2>
        <p className="mb-4 max-w-xl text-sm text-noir/60">
          Add an image here if you&apos;d rather show one chart image covering all sizes instead of (or alongside) the
          measurement table below. If an image is set, it&apos;s what shows on the product page and in the size guide popup.
        </p>
        <form action={updateDetails} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input name="title" defaultValue={guide.title} required className="input" />
          </div>
          <div>
            <label className="label">Unit</label>
            <select name="unit" defaultValue={guide.unit} className="input">
              <option value="in">Inches</option>
              <option value="cm">Centimeters</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <ImageUploadField name="imageUrl" defaultValue={guide.imageUrl} label="Size Chart Image (optional)" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Instructions (optional)</label>
            <textarea name="instructions" defaultValue={guide.instructions ?? ""} rows={2} className="input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Save Details
            </button>
          </div>
        </form>
      </section>

      {measurementKeys.length > 0 ? (
        <section className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Measurements ({guide.unit})</h2>
          <form action={updateRows}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone text-left">
                    <th className="py-2 pr-4">Size</th>
                    {measurementKeys.map((key) => (
                      <th key={key} className="py-2 pr-4">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row) => {
                    const measurements = row.measurements as Record<string, string>;
                    return (
                      <tr key={row.id} className="border-b border-stone/50">
                        <td className="py-2 pr-4 font-medium">{row.sizeName}</td>
                        {measurementKeys.map((key) => (
                          <td key={key} className="py-2 pr-4">
                            <input
                              name={`row_${row.id}_${key}`}
                              defaultValue={measurements[key] ?? ""}
                              placeholder="—"
                              className="input w-24"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="submit" className="btn-primary mt-4">
              Save Measurements
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
