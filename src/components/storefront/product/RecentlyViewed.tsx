"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProductCardVM } from "@/types/product";
import { WishlistButton } from "../WishlistButton";
import { useFormatMoney } from "../CurrencyProvider";

const STORAGE_KEY = "ak_recently_viewed";
const MAX_ITEMS = 8;
const PLACEHOLDER = "/images/placeholder-product.svg";

export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<ProductCardVM[]>([]);
  const format = useFormatMoney();

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
          <div key={p.id} className="group relative">
            <Link href={`/product/${p.slug}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden bg-stone">
                <Image
                  src={p.primaryImage ?? PLACEHOLDER}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="absolute right-3 top-3">
              <WishlistButton productId={p.id} />
            </div>
            <div className="mt-3 space-y-1 text-center">
              <Link href={`/product/${p.slug}`} className="block text-sm text-noir hover:text-clay-600">
                {p.name}
              </Link>
              <p className="text-sm font-medium">{format(p.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
