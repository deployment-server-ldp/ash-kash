import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { getStoreSettings } from "@/lib/data/settings";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    title: {
      default: `${settings.storeName} — Premium Women's Fashion`,
      template: `%s | ${settings.storeName}`,
    },
    description:
      "Ash & Kash is a premium women's fashion boutique offering elevated ready-to-wear, luxury pieces, and considered essentials.",
    icons: { icon: settings.faviconUrl || "/favicon.svg" },
    verification: { google: "_U-Tl9PTJuDjElVLsMZwYQuCUSboWf8lnh4tVAOqKr0" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const sameAs = [
    settings.socialInstagram ? `https://instagram.com/${settings.socialInstagram}` : null,
    settings.socialFacebook || null,
    settings.socialTiktok ? `https://tiktok.com/@${settings.socialTiktok}` : null,
    settings.socialPinterest || null,
  ].filter((url): url is string => Boolean(url));

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.storeName,
    url: baseUrl,
    logo: settings.logoUrl && !settings.logoUrl.startsWith("data:") ? settings.logoUrl : undefined,
    // Based in Dubai, UAE — ships worldwide.
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contactAddress ?? undefined,
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    contactPoint:
      settings.contactPhone || settings.contactEmail
        ? {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: settings.contactPhone ?? undefined,
            email: settings.contactEmail ?? undefined,
            areaServed: "Worldwide",
          }
        : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.storeName,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        {children}
      </body>
    </html>
  );
}
