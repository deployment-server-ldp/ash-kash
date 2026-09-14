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
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
