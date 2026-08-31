import { Header, AnnouncementBar } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartUIProvider } from "@/components/storefront/CartUIProvider";
import { CurrencyProvider } from "@/components/storefront/CurrencyProvider";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { MaintenancePage } from "@/components/storefront/MaintenancePage";
import { getCartViewData } from "@/lib/cart-view";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { getStoreSettings } from "@/lib/data/settings";
import { getSession, isAdminRole } from "@/lib/auth/session";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  if (settings.maintenanceMode) {
    const session = await getSession();
    const isPreviewingAdmin = session && isAdminRole(session.role);
    if (!isPreviewingAdmin) {
      return <MaintenancePage storeName={settings.storeName} message={settings.maintenanceMessage} />;
    }
  }

  const [cart, currency] = await Promise.all([getCartViewData(), resolveCurrentCurrency()]);

  return (
    <CurrencyProvider currency={currency}>
      <CartUIProvider>
        {settings.maintenanceMode ? (
          <div className="bg-noir py-1.5 text-center text-[11px] uppercase tracking-wide text-ivory">
            Maintenance mode is ON — visitors see the &quot;Under Development&quot; page. Only you can see the live site.
          </div>
        ) : null}
        {settings.freeShippingNote ? <AnnouncementBar text={settings.freeShippingNote} /> : null}
        <Header cart={cart} />
        <main>{children}</main>
        <Footer />
        <CartDrawer cart={cart} />
      </CartUIProvider>
    </CurrencyProvider>
  );
}
