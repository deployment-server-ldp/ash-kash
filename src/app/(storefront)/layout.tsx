import { Header, AnnouncementBar } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartUIProvider } from "@/components/storefront/CartUIProvider";
import { CurrencyProvider } from "@/components/storefront/CurrencyProvider";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { getCartViewData } from "@/lib/cart-view";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { getStoreSettings } from "@/lib/data/settings";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [cart, currency, settings] = await Promise.all([
    getCartViewData(),
    resolveCurrentCurrency(),
    getStoreSettings(),
  ]);

  return (
    <CurrencyProvider currency={currency}>
      <CartUIProvider>
        {settings.freeShippingNote ? <AnnouncementBar text={settings.freeShippingNote} /> : null}
        <Header cart={cart} />
        <main>{children}</main>
        <Footer />
        <CartDrawer cart={cart} />
      </CartUIProvider>
    </CurrencyProvider>
  );
}
