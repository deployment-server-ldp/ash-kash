"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { X, Minus, Plus } from "lucide-react";
import { useCartUI } from "./CartUIProvider";
import { useFormatMoney } from "./CurrencyProvider";
import type { CartViewData } from "@/lib/cart-view";
import { removeCartItem, updateCartItemQuantity } from "@/actions/cart";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/images/placeholder-product.svg";

export function CartDrawer({ cart }: { cart: CartViewData }) {
  const { isCartOpen, closeCart } = useCartUI();
  const format = useFormatMoney();
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("fixed inset-0 z-50 transition-opacity", isCartOpen ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        className={cn("absolute inset-0 bg-noir/40 transition-opacity", isCartOpen ? "opacity-100" : "opacity-0")}
        onClick={closeCart}
      />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-xl transition-transform duration-300",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-stone px-6 py-5">
          <h2 className="font-display text-lg">Your Bag ({cart.itemCount})</h2>
          <button onClick={closeCart} aria-label="Close bag">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-noir/60">Your bag is empty.</p>
              <Link href="/shop" onClick={closeCart} className="btn-outline">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-stone">
                    <Image src={item.image ?? PLACEHOLDER} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/product/${item.slug}`} onClick={closeCart} className="text-sm hover:text-clay-600">
                        {item.name}
                      </Link>
                      {item.variantTitle ? <p className="text-xs text-noir/50">{item.variantTitle}</p> : null}
                      <p className="mt-1 text-sm font-medium">{format(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-stone">
                        <button
                          disabled={pending}
                          className="p-1.5"
                          onClick={() => startTransition(async () => { await updateCartItemQuantity(item.id, item.quantity - 1); })}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          disabled={pending || item.quantity >= item.maxQuantity}
                          className="p-1.5"
                          onClick={() => startTransition(async () => { await updateCartItemQuantity(item.id, item.quantity + 1); })}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        disabled={pending}
                        onClick={() => startTransition(async () => { await removeCartItem(item.id); })}
                        className="text-xs uppercase tracking-wide text-noir/50 hover:text-noir"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.items.length > 0 ? (
          <div className="border-t border-stone px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-noir/60">Subtotal</span>
              <span className="font-medium">{format(cart.subtotal)}</span>
            </div>
            <p className="mb-4 text-xs text-noir/50">Shipping and discounts calculated at checkout.</p>
            <Link href="/checkout" onClick={closeCart} className="btn-primary w-full">
              Checkout
            </Link>
            <Link href="/cart" onClick={closeCart} className="btn-outline mt-2 w-full">
              View Bag
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
