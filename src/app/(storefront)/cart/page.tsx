import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCartViewData } from "@/lib/cart-view";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { formatMoney } from "@/lib/currency/format";
import { CartLineControls } from "@/components/storefront/CartLineControls";
import { CouponForm } from "@/components/storefront/CouponForm";

export const metadata: Metadata = { title: "Your Bag" };

const PLACEHOLDER = "/images/placeholder-product.svg";

export default async function CartPage() {
  const [cart, currency] = await Promise.all([getCartViewData(), resolveCurrentCurrency()]);
  const f = (n: number) => formatMoney(n, currency);

  if (cart.items.length === 0) {
    return (
      <div className="container-boutique flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-display text-3xl">Your Bag is Empty</h1>
        <Link href="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-boutique py-12">
      <h1 className="mb-8 font-display text-3xl">Your Bag</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-stone">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-6">
              <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-stone">
                <Image src={item.image ?? PLACEHOLDER} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/product/${item.slug}`} className="hover:text-clay-600">
                    {item.name}
                  </Link>
                  {item.variantTitle ? <p className="text-sm text-noir/50">{item.variantTitle}</p> : null}
                  <p className="mt-1 font-medium">{f(item.unitPrice)}</p>
                </div>
                <CartLineControls itemId={item.id} quantity={item.quantity} maxQuantity={item.maxQuantity} />
              </div>
              <p className="font-medium">{f(item.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <div className="h-fit space-y-6 border border-stone p-6">
          <h2 className="font-display text-xl">Order Summary</h2>
          <CouponForm appliedCode={cart.couponCode} error={cart.couponError} />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-noir/60">Subtotal</span>
              <span>{f(cart.subtotal)}</span>
            </div>
            {cart.discountTotal > 0 ? (
              <div className="flex justify-between text-clay-600">
                <span>Discount</span>
                <span>-{f(cart.discountTotal)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-noir/60">Shipping</span>
              <span>{cart.freeShippingApplied ? "Free" : f(cart.shippingTotal)}</span>
            </div>
            {cart.taxTotal > 0 ? (
              <div className="flex justify-between">
                <span className="text-noir/60">Tax</span>
                <span>{f(cart.taxTotal)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-stone pt-2 text-base font-medium">
              <span>Total</span>
              <span>{f(cart.grandTotal)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
