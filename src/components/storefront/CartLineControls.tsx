"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { removeCartItem, updateCartItemQuantity } from "@/actions/cart";

export function CartLineControls({ itemId, quantity, maxQuantity }: { itemId: string; quantity: number; maxQuantity: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center border border-stone">
        <button
          disabled={pending}
          className="p-2"
          onClick={() => startTransition(async () => { await updateCartItemQuantity(itemId, quantity - 1); })}
          aria-label="Decrease quantity"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-10 text-center text-sm">{quantity}</span>
        <button
          disabled={pending || quantity >= maxQuantity}
          className="p-2"
          onClick={() => startTransition(async () => { await updateCartItemQuantity(itemId, quantity + 1); })}
          aria-label="Increase quantity"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        disabled={pending}
        onClick={() => startTransition(async () => { await removeCartItem(itemId); })}
        className="text-xs uppercase tracking-wide text-noir/50 hover:text-noir"
      >
        Remove
      </button>
    </div>
  );
}
