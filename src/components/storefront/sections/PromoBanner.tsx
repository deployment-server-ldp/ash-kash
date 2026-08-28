import Image from "next/image";
import Link from "next/link";
import type { HomepageSection } from "@prisma/client";

const PLACEHOLDER = "/images/placeholder-product.svg";

export function PromoBanner({ section }: { section: HomepageSection }) {
  return (
    <section className="relative flex h-[60vh] min-h-[400px] items-center justify-center overflow-hidden bg-noir text-center text-ivory">
      <Image src={section.imageUrl ?? PLACEHOLDER} alt={section.title ?? ""} fill className="object-cover opacity-70" />
      <div className="relative z-10 max-w-lg px-6">
        {section.subtitle ? <p className="eyebrow mb-3 text-ivory/80">{section.subtitle}</p> : null}
        {section.title ? <h2 className="font-display text-4xl">{section.title}</h2> : null}
        {section.content ? <p className="mt-4 text-ivory/80">{section.content}</p> : null}
        {section.buttonText && section.buttonUrl ? (
          <Link href={section.buttonUrl} className="btn mt-6 bg-ivory text-noir hover:bg-clay-200">
            {section.buttonText}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
