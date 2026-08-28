"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Menu, Search, User, Heart, ShoppingBag, X, ChevronDown } from "lucide-react";
import type { ResolvedMenuItem } from "@/lib/data/menu";
import type { CurrencyDTO } from "@/lib/currency/service";
import { useCartUI } from "./CartUIProvider";
import { switchCurrency } from "@/actions/misc";
import { SearchOverlay } from "./SearchOverlay";

export function HeaderClient({
  menuItems,
  storeName,
  logoUrl,
  currencies,
  currentCurrency,
  cartCount,
}: {
  menuItems: ResolvedMenuItem[];
  storeName: string;
  logoUrl: string | null;
  currencies: CurrencyDTO[];
  currentCurrency: CurrencyDTO;
  cartCount: number;
}) {
  const { openCart, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, openSearch } = useCartUI();
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-40 border-b border-stone bg-ivory/95 backdrop-blur">
      <div className="container-boutique flex h-20 items-center justify-between">
        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={toggleMobileMenu} aria-label="Open menu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <Link href="/" className="font-display text-2xl tracking-wide">
          {logoUrl ? <Image src={logoUrl} alt={storeName} width={140} height={40} className="h-9 w-auto" /> : storeName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {menuItems.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={item.url} className="text-xs uppercase tracking-wide2 text-noir hover:text-clay-600">
                {item.label}
              </Link>
              {item.children.length > 0 ? (
                <div className="invisible absolute left-0 top-full z-10 min-w-[200px] border border-stone bg-ivory py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link key={child.id} href={child.url} className="block px-4 py-2 text-sm hover:bg-stone">
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={openSearch} aria-label="Search" className="hidden sm:block">
            <Search className="h-5 w-5" />
          </button>

          <div className="relative hidden sm:block">
            <button
              onClick={() => setCurrencyMenuOpen((v) => !v)}
              className="flex items-center gap-1 text-xs uppercase tracking-wide"
            >
              {currentCurrency.code} <ChevronDown className="h-3 w-3" />
            </button>
            {currencyMenuOpen ? (
              <div className="absolute right-0 top-full z-10 mt-2 min-w-[140px] border border-stone bg-ivory py-1 shadow-lg">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() =>
                      startTransition(async () => {
                        await switchCurrency(c.code);
                        setCurrencyMenuOpen(false);
                      })
                    }
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-stone"
                  >
                    {c.code} — {c.symbol}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <Link href="/account" aria-label="Account" className="hidden sm:block">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:block">
            <Heart className="h-5 w-5" />
          </Link>
          <button onClick={openCart} aria-label="Bag" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-clay-600 text-[10px] text-ivory">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-stone bg-ivory px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.url}
                  onClick={closeMobileMenu}
                  className="block py-2.5 text-sm uppercase tracking-wide"
                >
                  {item.label}
                </Link>
                {item.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.url}
                    onClick={closeMobileMenu}
                    className="block py-2 pl-4 text-sm text-noir/70"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link href="/account" onClick={closeMobileMenu} className="mt-2 border-t border-stone py-2.5 text-sm">
              Account
            </Link>
            <Link href="/wishlist" onClick={closeMobileMenu} className="py-2.5 text-sm">
              Wishlist
            </Link>
          </nav>
        </div>
      ) : null}

      <SearchOverlay />
    </header>
  );
}
