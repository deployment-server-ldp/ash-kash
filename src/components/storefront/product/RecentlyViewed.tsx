"use client";

import { useEffect, useState } from "react";
import type { ProductCardVM } from "@/types/product";
import { ProductCard } from "../ProductCard";

const STORAGE_KEY = "ak_recently_viewed";
const MAX_ITEMS = 8;

export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<ProductCardVM[]>([]);

  useEffect(() => {
    let stored: string[] = [];
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      stored = [];
    }

    const toShow = stored.filter((id) => id !== currentProductId).slice(0, MAX_ITEMS);
    const updated = [currentProductId, ...stored.filter((id) => id !== currentProductId)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (toShow.length === 0) return;
    fetch(`/api/products/by-ids?ids=${toShow.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => undefined);
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="container-boutique py-16">
      <h2 className="mb-8 font-display text-2xl">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
