import Image from "next/image";
import Link from "next/link";
import type { HomepageSection } from "@prisma/client";

const PLACEHOLDER = "/images/placeholder-product.svg";

export function BrandStory({ section }: { section: HomepageSection }) {
  return (
    <section className="container-boutique grid grid-cols-1 items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
      <div className="relative aspect-[4/5]">
        <Image src={section.imageUrl ?? PLACEHOLDER} alt={section.title ?? ""} fill className="object-cover" />
      </div>
      <div>
        {section.subtitle ? <p className="eyebrow mb-3">{section.subtitle}</p> : null}
        {section.title ? <h2 className="font-display text-3xl sm:text-4xl">{section.title}</h2> : null}
        {section.content ? <p className="mt-4 max-w-md text-noir/70">{section.content}</p> : null}
        {section.buttonText && section.buttonUrl ? (
          <Link href={section.buttonUrl} className="btn-outline mt-6">
            {section.buttonText}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
