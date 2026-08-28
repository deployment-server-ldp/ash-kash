import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "about-us" } }),
    getStoreSettings(),
  ]);

  return (
    <div className="container-boutique max-w-3xl py-16">
      <h1 className="mb-8 text-center font-display text-4xl">About {settings.storeName}</h1>
      {page?.content ? (
        <div className="prose prose-neutral mx-auto max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      ) : (
        <p className="text-center text-noir/60">{settings.footerAbout ?? "Content for this page has not been added yet."}</p>
      )}
    </div>
  );
}
