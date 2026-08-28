import Image from "next/image";
import Link from "next/link";
import type { Collection, HomepageSection } from "@prisma/client";

const PLACEHOLDER = "/images/placeholder-product.svg";

export function CollectionShowcase({ section, collections }: { section: HomepageSection; collections: Collection[] }) {
  if (collections.length === 0) return null;
  return (
    <section className="container-boutique py-16 sm:py-24">
      {section.title ? (
        <div className="mb-10 text-center">
          {section.subtitle ? <p className="eyebrow mb-2">{section.subtitle}</p> : null}
          <h2 className="font-display text-3xl sm:text-4xl">{section.title}</h2>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collection/${collection.slug}`} className="group relative block overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={collection.imageUrl ?? PLACEHOLDER}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-noir/30" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-ivory">
              <h3 className="font-display text-2xl">{collection.name}</h3>
              <span className="mt-2 text-xs uppercase tracking-wide2">Discover</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
