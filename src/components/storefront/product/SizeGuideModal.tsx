"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { ProductDetailVM } from "@/types/product";
import { hasFilledMeasurements } from "@/lib/size-guide";

export function SizeGuideModal({ sizeGuide }: { sizeGuide: NonNullable<ProductDetailVM["sizeGuide"]> }) {
  const [open, setOpen] = useState(false);
  const columns = sizeGuide.rows.length > 0 ? Object.keys(sizeGuide.rows[0]!.measurements) : [];
  const showTable = hasFilledMeasurements(sizeGuide);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs uppercase tracking-wide underline">
        Size Guide
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir/50" onClick={() => setOpen(false)} />
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto bg-ivory p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl">{sizeGuide.title}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sizeGuide.instructions ? <p className="mb-4 text-sm text-noir/60">{sizeGuide.instructions}</p> : null}
            {sizeGuide.imageUrl ? (
              <div className="relative mb-4 h-auto w-full">
                <Image src={sizeGuide.imageUrl} alt={sizeGuide.title} width={800} height={800} unoptimized className="h-auto w-full object-contain" />
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
        </div>
      ) : null}
    </>
  );
}
