"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlist } from "@/actions/wishlist";

export function WishlistButton({
  productId,
  productVariantId,
  initialInWishlist = false,
  size = "sm",
}: {
  productId: string;
  productVariantId?: string | null;
  initialInWishlist?: boolean;
  size?: "sm" | "lg";
}) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const optimistic = !inWishlist;
          setInWishlist(optimistic);
          const result = await toggleWishlist(productId, productVariantId);
          if (!result.success) {
            setInWishlist(!optimistic);
          } else if (typeof result.inWishlist === "boolean") {
            setInWishlist(result.inWishlist);
          }
        });
      }}
      className={cn(
        "flex items-center justify-center rounded-full bg-ivory/90 shadow-sm transition-transform hover:scale-105",
        size === "sm" ? "h-8 w-8" : "h-11 w-11"
      )}
    >
      <Heart
        className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5", inWishlist ? "fill-clay-600 text-clay-600" : "text-noir")}
      />
    </button>
  );
}
