"use client";

import { createContext, useCallback, useContext, useState } from "react";

type CartUIContextValue = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setCartOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const value: CartUIContextValue = {
    isCartOpen,
    openCart: useCallback(() => setCartOpen(true), []),
    closeCart: useCallback(() => setCartOpen(false), []),
    isSearchOpen,
    openSearch: useCallback(() => setSearchOpen(true), []),
    closeSearch: useCallback(() => setSearchOpen(false), []),
    isMobileMenuOpen,
    toggleMobileMenu: useCallback(() => setMobileMenuOpen((v) => !v), []),
    closeMobileMenu: useCallback(() => setMobileMenuOpen(false), []),
  };

  return <CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>;
}

export function useCartUI() {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider");
  return ctx;
}
