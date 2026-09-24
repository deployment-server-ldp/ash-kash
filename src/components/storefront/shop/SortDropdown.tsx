"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPTIONS: { value: string; label: string }[] = [
  { value: "price_high", label: "Price: High to Low" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "newest", label: "Newest" },
  { value: "best_selling", label: "Best Selling" },
  { value: "featured", label: "Featured" },
];

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "price_high";

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="border border-stone bg-ivory px-3 py-2 text-sm"
      aria-label="Sort products"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          Sort: {opt.label}
        </option>
      ))}
    </select>
  );
}
