import Image from "next/image";
import type { ProductDetailVM } from "@/types/product";
import { hasFilledMeasurements } from "@/lib/size-guide";

export function SizeGuideContent({ sizeGuide }: { sizeGuide: NonNullable<ProductDetailVM["sizeGuide"]> }) {
  const columns = sizeGuide.rows.length > 0 ? Object.keys(sizeGuide.rows[0]!.measurements) : [];
  const showTable = hasFilledMeasurements(sizeGuide);

  return (
    <div>
      {sizeGuide.instructions ? <p className="mb-4 text-sm text-noir/60">{sizeGuide.instructions}</p> : null}
      {sizeGuide.imageUrl ? (
        <div className="relative mb-4 w-full">
          {/* width/height of 0 + sizes tells next/image to size itself from the real image's
              own aspect ratio via CSS, instead of forcing it into a fixed (and here,
              wrongly square) box that made non-square charts render shrunk down. */}
          <Image
            src={sizeGuide.imageUrl}
            alt={sizeGuide.title}
            width={0}
            height={0}
            sizes="100vw"
            unoptimized
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      ) : null}
      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone text-left">
                <th className="py-2 pr-4">Size</th>
                {columns.map((col) => (
                  <th key={col} className="py-2 pr-4">
                    {col} ({sizeGuide.unit})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeGuide.rows.map((row) => (
                <tr key={row.id} className="border-b border-stone/50">
                  <td className="py-2 pr-4 font-medium">{row.sizeName}</td>
                  {columns.map((col) => (
                    <td key={col} className="py-2 pr-4">
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
