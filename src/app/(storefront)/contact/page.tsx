import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/data/settings";
import { ContactForm } from "@/components/storefront/ContactForm";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="container-boutique grid max-w-4xl grid-cols-1 gap-10 py-16 sm:grid-cols-2">
      <div>
        <h1 className="mb-4 font-display text-4xl">Contact Us</h1>
        <p className="mb-6 text-noir/60">We&apos;d love to hear from you. Reach out with any questions.</p>
        <div className="space-y-1 text-sm text-noir/70">
          <p>{settings.contactEmail ?? "hello@example.com"}</p>
          <p>{settings.contactPhone ?? "—"}</p>
          <p>{settings.contactAddress ?? "—"}</p>
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
