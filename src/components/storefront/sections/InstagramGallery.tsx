import Image from "next/image";
import Link from "next/link";
import type { HomepageSection } from "@prisma/client";
import type { ProductCardVM } from "@/types/product";
import { getStoreSettings } from "@/lib/data/settings";

export async function InstagramGallery({ section, products }: { section: HomepageSection; products: ProductCardVM[] }) {
  if (products.length === 0) return null;
  const settings = await getStoreSettings();

  return (
    <section className="container-boutique py-16 sm:py-24">
      <div className="mb-10 text-center">
        {section.title ? <h2 className="font-display text-3xl sm:text-4xl">{section.title}</h2> : null}
        {settings.socialInstagram ? <p className="mt-2 text-sm text-noir/60">@{settings.socialInstagram}</p> : null}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {products.map((p) => (
          <Link key={p.id} href={`/product/${p.slug}`} className="relative aspect-square overflow-hidden">
            {p.primaryImage ? <Image src={p.primaryImage} alt={p.name} fill className="object-cover transition-transform hover:scale-105" /> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
