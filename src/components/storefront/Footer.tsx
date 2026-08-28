import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { getMenu } from "@/lib/data/menu";
import { getStoreSettings } from "@/lib/data/settings";
import { NewsletterForm } from "./NewsletterForm";

export async function Footer() {
  const [items, settings] = await Promise.all([getMenu("FOOTER"), getStoreSettings()]);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone bg-ivory">
      <div className="container-boutique grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-xl">{settings.storeName}</h3>
          <p className="mt-3 max-w-xs text-sm text-noir/60">
            {settings.footerAbout ?? "Considered pieces for the modern woman — elevated ready-to-wear and enduring essentials."}
          </p>
          <div className="mt-4 flex gap-4">
            {settings.socialInstagram ? (
              <a href={`https://instagram.com/${settings.socialInstagram}`} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            ) : null}
            {settings.socialFacebook ? (
              <a href={settings.socialFacebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">Customer Service</p>
          <ul className="space-y-2 text-sm text-noir/70">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={item.url} className="hover:text-noir">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-2 text-sm text-noir/70">
            {settings.contactEmail ? <li>{settings.contactEmail}</li> : null}
            {settings.contactPhone ? <li>{settings.contactPhone}</li> : null}
            {settings.contactAddress ? <li>{settings.contactAddress}</li> : null}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Stay in Touch</p>
          <p className="mb-4 text-sm text-noir/60">Sign up for early access to new arrivals and private sales.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-stone py-6 text-center text-xs text-noir/50">
        {settings.footerCopyright ?? `© ${year} ${settings.storeName}. All rights reserved.`}
      </div>
    </footer>
  );
}
