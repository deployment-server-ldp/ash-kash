import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCartViewData } from "@/lib/cart-view";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { formatMoney } from "@/lib/currency/format";
import { getStoreSettings } from "@/lib/data/settings";
import { CheckoutForm } from "@/components/storefront/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cart, currency, settings, countries] = await Promise.all([
    getCartViewData(),
    resolveCurrentCurrency(),
    getStoreSettings(),
    prisma.country.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (cart.items.length === 0) redirect("/cart");
  if (!settings.codEnabled) {
    return (
      <div className="container-boutique py-24 text-center">
        <h1 className="font-display text-3xl">Checkout Unavailable</h1>
        <p className="mt-3 text-noir/60">Checkout is temporarily unavailable. Please check back soon.</p>
      </div>
    );
  }

  const f = (n: number) => formatMoney(n, currency);

  return (
    <div className="container-boutique py-12">
      <h1 className="mb-8 font-display text-3xl">Checkout</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <CheckoutForm countries={countries} defaultCountry={settings.defaultCountryCode} />

        <div className="h-fit space-y-4 border border-stone p-6">
          <h2 className="font-display text-xl">Order Summary</h2>
          <ul className="divide-y divide-stone">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between py-3 text-sm">
                <span>
                  {item.name} {item.variantTitle ? `(${item.variantTitle})` : ""} × {item.quantity}
                </span>
                <span>{f(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-stone pt-3 text-sm">
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
          <p className="text-xs text-noir/50">
            Have a coupon? <Link href="/cart" className="underline">Apply it in your bag</Link> before checking out.
          </p>
        </div>
      </div>
    </div>
  );
}
