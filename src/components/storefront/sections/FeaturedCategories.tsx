import Image from "next/image";
import Link from "next/link";
import type { Category, HomepageSection } from "@prisma/client";

const PLACEHOLDER = "/images/placeholder-product.svg";

export function FeaturedCategories({ section, categories }: { section: HomepageSection; categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="container-boutique py-16 sm:py-24">
      {section.title || section.subtitle ? (
        <div className="mb-10 text-center">
          {section.subtitle ? <p className="eyebrow mb-2">{section.subtitle}</p> : null}
          {section.title ? <h2 className="font-display text-3xl sm:text-4xl">{section.title}</h2> : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} className="group relative block overflow-hidden">
            <div className="relative aspect-[4/5]">
              <Image
                src={category.imageUrl ?? PLACEHOLDER}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-6 text-center text-ivory">
              <h3 className="font-display text-xl">{category.name}</h3>
              <span className="mt-1 inline-block text-xs uppercase tracking-wide2">Shop Now</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
