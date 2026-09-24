import Image from "next/image";
import type { ProductDetailVM } from "@/types/product";
import { hasFilledMeasurements } from "@/lib/size-guide";

export function SizeGuideSection({ sizeGuide }: { sizeGuide: NonNullable<ProductDetailVM["sizeGuide"]> }) {
  const columns = sizeGuide.rows.length > 0 ? Object.keys(sizeGuide.rows[0]!.measurements) : [];
  const showTable = hasFilledMeasurements(sizeGuide);
  if (!sizeGuide.imageUrl && !showTable) return null;

  return (
    <div className="mt-16 border-t border-stone pt-10">
      <h2 className="mb-4 font-display text-2xl">{sizeGuide.title}</h2>
      {sizeGuide.instructions ? <p className="mb-6 max-w-2xl text-sm text-noir/60">{sizeGuide.instructions}</p> : null}
      {sizeGuide.imageUrl ? (
        <div className="relative mb-6 max-w-xl">
          <Image src={sizeGuide.imageUrl} alt={sizeGuide.title} width={900} height={900} unoptimized className="h-auto w-full object-contain" />
        </div>
      ) : null}
      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full max-w-2xl text-sm">
            <thead>
              <tr className="border-b border-stone text-left">
                <th className="py-2 pr-6">Size</th>
                {columns.map((col) => (
                  <th key={col} className="py-2 pr-6">
                    {col} ({sizeGuide.unit})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeGuide.rows.map((row) => (
                <tr key={row.id} className="border-b border-stone/50">
                  <td className="py-2 pr-6 font-medium">{row.sizeName}</td>
                  {columns.map((col) => (
                    <td key={col} className="py-2 pr-6">
                      {row.measurements[col] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
