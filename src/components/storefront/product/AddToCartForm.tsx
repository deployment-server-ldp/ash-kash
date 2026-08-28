"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { ProductDetailVM } from "@/types/product";
import { addToCart } from "@/actions/cart";
import { useCartUI } from "../CartUIProvider";
import { useFormatMoney } from "../CurrencyProvider";
import { SizeGuideModal } from "./SizeGuideModal";

export function AddToCartForm({ product }: { product: ProductDetailVM }) {
  const hasVariants = product.variants.length > 0;
  const sizes = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of product.variants) if (v.sizeId && v.sizeName) map.set(v.sizeId, v.sizeName);
    return [...map.entries()];
  }, [product.variants]);
  const colors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string | null }>();
    for (const v of product.variants) if (v.colorId && v.colorName) map.set(v.colorId, { name: v.colorName, hex: v.colorHex });
    return [...map.entries()];
  }, [product.variants]);

  const [sizeId, setSizeId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { openCart } = useCartUI();
  const format = useFormatMoney();
  const router = useRouter();

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return (
      product.variants.find(
        (v) => (sizes.length === 0 || v.sizeId === sizeId) && (colors.length === 0 || v.colorId === colorId)
      ) ?? null
    );
  }, [hasVariants, product.variants, sizeId, colorId, sizes.length, colors.length]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const maxQty = product.trackInventory
    ? hasVariants
      ? selectedVariant?.inventoryQuantity ?? 0
      : product.inventoryQuantity
    : 999;
  const outOfStock = product.trackInventory && hasVariants && selectedVariant && maxQty <= 0;

  function handleAdd(buyNow: boolean) {
    setError(null);
    if (hasVariants && !selectedVariant) {
      setError("Please select a size" + (colors.length > 0 ? " and color." : "."));
      return;
    }
    startTransition(async () => {
      const result = await addToCart({
        productId: product.id,
        productVariantId: selectedVariant?.id ?? null,
        quantity,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (buyNow) {
        router.push("/checkout");
      } else {
        openCart();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-2xl">{format(displayPrice)}</span>
        {displayCompareAt && displayCompareAt > displayPrice ? (
          <span className="ml-3 text-noir/40 line-through">{format(displayCompareAt)}</span>
        ) : null}
      </div>

      {colors.length > 0 ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide2 text-noir/60">Color</p>
          <div className="flex gap-2">
            {colors.map(([id, c]) => (
              <button
                key={id}
                onClick={() => setColorId(id)}
                title={c.name}
                className={`h-9 w-9 rounded-full border-2 ${colorId === id ? "border-noir" : "border-transparent"}`}
              >
                <span className="block h-full w-full rounded-full border border-stone" style={{ backgroundColor: c.hex ?? "#ccc" }} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide2 text-noir/60">Size</p>
            {product.sizeGuide ? <SizeGuideModal sizeGuide={product.sizeGuide} /> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map(([id, name]) => (
              <button
                key={id}
                onClick={() => setSizeId(id)}
                className={`border px-4 py-2 text-sm ${sizeId === id ? "border-noir bg-noir text-ivory" : "border-stone hover:border-noir"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-stone">
          <button className="p-2.5" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center">{quantity}</span>
          <button
            className="p-2.5"
            onClick={() => setQuantity((q) => Math.min(maxQty || 20, q + 1))}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {product.trackInventory && maxQty > 0 && maxQty <= 5 ? (
          <span className="text-xs text-clay-600">Only {maxQty} left</span>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handleAdd(false)}
          disabled={pending || outOfStock || !product.inStock}
          className="btn-primary flex-1"
        >
          {outOfStock || !product.inStock ? "Sold Out" : "Add to Bag"}
        </button>
        <button
          onClick={() => handleAdd(true)}
          disabled={pending || outOfStock || !product.inStock}
          className="btn-outline flex-1"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
