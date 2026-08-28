import type { HomepageSection } from "@prisma/client";
import { NewsletterForm } from "../NewsletterForm";

export function NewsletterSection({ section }: { section: HomepageSection }) {
  return (
    <section className="bg-noir py-16 text-center text-ivory sm:py-20">
      <div className="container-boutique mx-auto max-w-lg">
        {section.title ? <h2 className="font-display text-3xl">{section.title}</h2> : null}
        {section.subtitle ? <p className="mt-2 text-ivory/70">{section.subtitle}</p> : null}
        <div className="mt-6 [&_.input]:bg-transparent [&_.input]:text-ivory [&_.input]:border-ivory/30 [&_.btn-primary]:bg-ivory [&_.btn-primary]:text-noir">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
