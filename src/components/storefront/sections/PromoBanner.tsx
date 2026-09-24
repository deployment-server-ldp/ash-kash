import Image from "next/image";
import Link from "next/link";
import type { HomepageSection } from "@prisma/client";

const PLACEHOLDER = "/images/placeholder-product.svg";

export function PromoBanner({ section }: { section: HomepageSection }) {
  // A URL with no button text means the whole banner should be clickable (no visible
  // button needed); a URL with button text keeps the explicit button as before.
  const wholeClickable = Boolean(section.buttonUrl && !section.buttonText);

  if (section.imageUrl2) {
    return (
      <section className="py-10 sm:py-16">
        <div className="container-boutique">
          {section.subtitle || section.title || section.content ? (
            <div className="mb-6 text-center">
              {section.subtitle ? <p className="eyebrow mb-2">{section.subtitle}</p> : null}
              {section.title ? <h2 className="font-display text-3xl">{section.title}</h2> : null}
              {section.content ? <p className="mt-2 text-noir/60">{section.content}</p> : null}
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[section.imageUrl, section.imageUrl2].map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden bg-stone">
                <Image src={src ?? PLACEHOLDER} alt={section.title ?? ""} fill className="object-cover" />
                {wholeClickable ? (
                  <Link href={section.buttonUrl!} className="absolute inset-0" aria-label={section.title ?? "View more"} />
                ) : null}
              </div>
            ))}
          </div>
          {section.buttonText && section.buttonUrl ? (
            <div className="mt-6 text-center">
              <Link href={section.buttonUrl} className="btn-outline">
                {section.buttonText}
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex h-[60vh] min-h-[400px] items-center justify-center overflow-hidden bg-noir text-center text-ivory">
      <Image src={section.imageUrl ?? PLACEHOLDER} alt={section.title ?? ""} fill className="object-cover opacity-70" />
      {wholeClickable ? (
        <Link href={section.buttonUrl!} className="absolute inset-0 z-20" aria-label={section.title ?? "View more"} />
      ) : null}
      <div className="relative z-10 max-w-lg px-6">
        {section.subtitle ? <p className="eyebrow mb-3 text-ivory/80">{section.subtitle}</p> : null}
        {section.title ? <h2 className="font-display text-4xl">{section.title}</h2> : null}
        {section.content ? <p className="mt-4 text-ivory/80">{section.content}</p> : null}
        {section.buttonText && section.buttonUrl ? (
          <Link href={section.buttonUrl} className="btn relative z-30 mt-6 bg-ivory text-noir hover:bg-clay-200">
            {section.buttonText}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
