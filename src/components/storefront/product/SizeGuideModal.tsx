"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ProductDetailVM } from "@/types/product";
import { SizeGuideContent } from "./SizeGuideContent";

export function SizeGuideModal({ sizeGuide }: { sizeGuide: NonNullable<ProductDetailVM["sizeGuide"]> }) {
  const [open, setOpen] = useState(false);

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
            <SizeGuideContent sizeGuide={sizeGuide} />
          </div>
        </div>
      ) : null}
    </>
  );
}
