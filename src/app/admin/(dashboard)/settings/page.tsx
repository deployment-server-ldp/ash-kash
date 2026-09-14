import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/data/settings";
import { requireAdmin } from "@/lib/auth/guards";
import { updateCheckoutSettings, updateGeneralSettings, updateMaintenanceMode, updateNewsletterSettings } from "@/actions/admin/settings";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin("settings");
  const settings = await getStoreSettings();
  const countries = await prisma.country.findMany({ orderBy: { name: "asc" } });
  const currencies = await prisma.currency.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl">Settings</h1>

      <section className={`max-w-2xl border p-6 ${settings.maintenanceMode ? "border-amber-400 bg-amber-50" : "border-stone bg-ivory"}`}>
        <h2 className="mb-2 font-display text-lg">Site Visibility</h2>
        <p className="mb-4 text-sm text-noir/60">
          While maintenance mode is on, visitors see an &quot;Under Development&quot; page — only signed-in admins can
          see and preview the real storefront. Turn it off when you&apos;re ready to launch.
        </p>
        <form action={updateMaintenanceMode} className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="maintenanceMode" value="true" defaultChecked={settings.maintenanceMode} className="accent-clay-600" />
            {settings.maintenanceMode ? "Site is under development (not live to visitors)" : "Site is live"}
          </label>
          <div>
            <label className="label">Under-development message (optional)</label>
            <textarea
              name="maintenanceMessage"
              defaultValue={settings.maintenanceMessage ?? ""}
              rows={2}
              placeholder="We're putting the finishing touches on something beautiful. Please check back soon."
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </form>
      </section>

      <section className="max-w-2xl border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Brand &amp; Contact</h2>
        <form action={updateGeneralSettings} className="space-y-4">
          <div>
            <label className="label">Store Name</label>
            <input name="storeName" defaultValue={settings.storeName} required className="input" />
          </div>
          <ImageUploadField name="logoUrl" defaultValue={settings.logoUrl} label="Logo" storeInline />
          <ImageUploadField name="faviconUrl" defaultValue={settings.faviconUrl} label="Favicon (use a square image, e.g. 64x64px)" storeInline />
          <div>
            <label className="label">Brand Color</label>
            <input type="color" name="brandColor" defaultValue={settings.brandColor} className="h-10 w-16 border border-stone" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Email</label>
              <input name="contactEmail" defaultValue={settings.contactEmail ?? ""} className="input" />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input name="contactPhone" defaultValue={settings.contactPhone ?? ""} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Contact Address</label>
            <textarea name="contactAddress" defaultValue={settings.contactAddress ?? ""} rows={2} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Instagram Handle</label>
              <input name="socialInstagram" defaultValue={settings.socialInstagram ?? ""} className="input" />
            </div>
            <div>
              <label className="label">Facebook URL</label>
              <input name="socialFacebook" defaultValue={settings.socialFacebook ?? ""} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Footer About Text</label>
            <textarea name="footerAbout" defaultValue={settings.footerAbout ?? ""} rows={2} className="input" />
          </div>
          <div>
            <label className="label">Footer Copyright</label>
            <input name="footerCopyright" defaultValue={settings.footerCopyright ?? ""} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </form>
      </section>

      <section className="max-w-2xl border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Checkout, Shipping &amp; Tax</h2>
        <form action={updateCheckoutSettings} className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="codEnabled" value="true" defaultChecked={settings.codEnabled} className="accent-clay-600" />
            Cash on Delivery enabled
          </label>
          <div>
            <label className="label">Free Shipping Note</label>
            <input name="freeShippingNote" defaultValue={settings.freeShippingNote ?? ""} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Base Currency</label>
              <select name="baseCurrencyCode" defaultValue={settings.baseCurrencyCode} className="input">
                {currencies.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Default Country</label>
              <select name="defaultCountryCode" defaultValue={settings.defaultCountryCode} className="input">
                {countries.map((c) => (
                  <option key={c.id} value={c.iso2}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="taxEnabled" value="true" defaultChecked={settings.taxEnabled} className="accent-clay-600" />
            Enable Tax
          </label>
          <div className="max-w-xs">
            <label className="label">Default Tax Rate (%)</label>
            <input type="number" step="0.01" name="defaultTaxRate" defaultValue={settings.defaultTaxRate.toString()} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </form>
      </section>

      <section className="max-w-2xl border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Newsletter</h2>
        <form action={updateNewsletterSettings} className="space-y-4">
          <div>
            <label className="label">Provider</label>
            <select name="newsletterProvider" defaultValue={settings.newsletterProvider} className="input">
              <option value="none">None</option>
              <option value="mailchimp">Mailchimp</option>
              <option value="klaviyo">Klaviyo</option>
              <option value="brevo">Brevo</option>
            </select>
          </div>
          <div>
            <label className="label">API Key</label>
            <input type="password" name="newsletterApiKey" defaultValue={settings.newsletterApiKey ?? ""} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </form>
      </section>
    </div>
  );
}
