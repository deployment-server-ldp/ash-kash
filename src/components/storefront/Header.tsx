import Link from "next/link";
import { getMenu } from "@/lib/data/menu";
import { getStoreSettings } from "@/lib/data/settings";
import { getActiveCurrencies, resolveCurrentCurrency } from "@/lib/currency/service";
import type { CartViewData } from "@/lib/cart-view";
import { HeaderClient } from "./HeaderClient";

export async function Header({ cart }: { cart: CartViewData }) {
  const [items, settings, currencies, currentCurrency] = await Promise.all([
    getMenu("HEADER"),
    getStoreSettings(),
    getActiveCurrencies(),
    resolveCurrentCurrency(),
  ]);

  return (
    <HeaderClient
      menuItems={items}
      storeName={settings.storeName}
      logoUrl={settings.logoUrl}
      currencies={currencies}
      currentCurrency={currentCurrency}
      cartCount={cart.itemCount}
    />
  );
}

export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="bg-noir py-2 text-center text-[11px] uppercase tracking-wide text-ivory">
      <Link href="/shop">{text}</Link>
    </div>
  );
}
