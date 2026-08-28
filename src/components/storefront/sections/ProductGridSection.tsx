import Link from "next/link";
import type { HomepageSection } from "@prisma/client";
import type { ProductCardVM } from "@/types/product";
import { ProductCard } from "../ProductCard";

export function ProductGridSection({ section, products }: { section: HomepageSection; products: ProductCardVM[] }) {
  if (products.length === 0) return null;
  return (
    <section className="container-boutique py-16 sm:py-24">
      <div className="mb-10 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          {section.subtitle ? <p className="eyebrow mb-2">{section.subtitle}</p> : null}
          {section.title ? <h2 className="font-display text-3xl sm:text-4xl">{section.title}</h2> : null}
        </div>
        {section.buttonText && section.buttonUrl ? (
          <Link href={section.buttonUrl} className="btn-outline">
            {section.buttonText}
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
