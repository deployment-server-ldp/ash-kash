"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function ProductAccordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-8 divide-y divide-stone border-t border-stone">
      {items.map((item, i) => (
        <div key={item.title}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-wide"
          >
            {item.title}
            <ChevronDown className={`h-4 w-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i ? <div className="whitespace-pre-line pb-4 text-sm text-noir/70">{item.content}</div> : null}
        </div>
      ))}
    </div>
  );
}
