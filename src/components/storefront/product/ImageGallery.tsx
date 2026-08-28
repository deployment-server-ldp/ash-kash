"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImageVM } from "@/types/product";

export function ImageGallery({ images, name }: { images: ProductImageVM[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [{ id: "placeholder", url: "/images/placeholder-product.svg", altText: name, isPrimary: true }];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-3 overflow-x-auto sm:flex-col">
        {list.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className={cn("relative h-20 w-16 flex-shrink-0 overflow-hidden border", i === active ? "border-noir" : "border-transparent")}
          >
            <Image src={img.url} alt={img.altText ?? name} fill className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-stone">
        <Image src={list[active]!.url} alt={list[active]!.altText ?? name} fill priority className="object-cover" />
      </div>
    </div>
  );
}
