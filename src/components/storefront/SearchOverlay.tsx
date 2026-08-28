"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";
import { useCartUI } from "./CartUIProvider";
import { useFormatMoney } from "./CurrencyProvider";

type SuggestResult = { id: string; name: string; slug: string; price: number; image: string | null };

const POPULAR_SEARCHES = ["New Arrivals", "Dresses", "Luxury Edit", "Sale"];

export function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useCartUI();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SuggestResult[]>([]);
  const format = useFormatMoney();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ivory">
      <div className="container-boutique flex items-center gap-4 border-b border-stone py-6">
        <Search className="h-5 w-5 text-noir/50" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              closeSearch();
              router.push(`/search?q=${encodeURIComponent(query)}`);
            }
            if (e.key === "Escape") closeSearch();
          }}
          placeholder="Search for products..."
          className="flex-1 bg-transparent text-lg outline-none placeholder:text-noir/40"
        />
        <button onClick={closeSearch} aria-label="Close search">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="container-boutique py-8">
        {query.trim().length < 2 ? (
          <div>
            <p className="eyebrow mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="border border-stone px-4 py-1.5 text-sm hover:border-noir"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="text-noir/60">No products found for &ldquo;{query}&rdquo;.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {results.map((r) => (
              <Link key={r.id} href={`/product/${r.slug}`} onClick={closeSearch} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-stone">
                  {r.image ? <Image src={r.image} alt={r.name} fill className="object-cover" /> : null}
                </div>
                <p className="mt-2 text-sm group-hover:text-clay-600">{r.name}</p>
                <p className="text-sm font-medium">{format(r.price)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
