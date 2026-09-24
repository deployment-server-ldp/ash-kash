"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SliderItem } from "@prisma/client";
import { cn } from "@/lib/utils";

export function HeroSlider({ slides }: { slides: SliderItem[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const duration = slides[active]?.durationMs ?? 6000;
    const timer = setTimeout(() => setActive((i) => (i + 1) % slides.length), duration);
    return () => clearTimeout(timer);
  }, [active, slides]);

  if (slides.length === 0) return null;

  return (
    <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden bg-noir">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === active ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <picture>
            {slide.mobileImage ? <source media="(max-width: 768px)" srcSet={slide.mobileImage} /> : null}
            <Image src={slide.desktopImage} alt={slide.title ?? ""} fill priority={i === 0} className="object-cover" />
          </picture>
          <div className="absolute inset-0 bg-noir" style={{ opacity: slide.overlayOpacity / 100 }} />
          <div
            className={cn(
              "container-boutique absolute inset-0 flex flex-col justify-center gap-4 text-ivory",
              slide.textAlign === "CENTER" && "items-center text-center",
              slide.textAlign === "RIGHT" && "items-end text-right"
            )}
          >
            {slide.tag ? <span className="eyebrow text-ivory/80">{slide.tag}</span> : null}
            {slide.title ? (
              <h1 className="max-w-xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">{slide.title}</h1>
            ) : null}
            {slide.subtitle ? <p className="max-w-md text-lg text-ivory/90">{slide.subtitle}</p> : null}
            {slide.description ? <p className="max-w-md text-sm text-ivory/70">{slide.description}</p> : null}
            {slide.buttonText && slide.buttonUrl ? (
              <Link href={slide.buttonUrl} className="btn relative z-30 bg-ivory text-noir hover:bg-clay-200 mt-2">
                {slide.buttonText}
              </Link>
            ) : null}
          </div>
          {/* A URL with no button text means the whole slide is clickable. */}
          {slide.buttonUrl && !slide.buttonText ? (
            <Link href={slide.buttonUrl} className="absolute inset-0 z-20" aria-label={slide.title ?? "View more"} />
          ) : null}
        </div>
      ))}

      {slides.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn("h-1.5 rounded-full transition-all", i === active ? "w-8 bg-ivory" : "w-1.5 bg-ivory/40")}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
