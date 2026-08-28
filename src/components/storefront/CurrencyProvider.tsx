"use client";

import { createContext, useContext } from "react";
import type { CurrencyDTO } from "@/lib/currency/service";
import { formatMoney } from "@/lib/currency/format";

const CurrencyContext = createContext<CurrencyDTO | null>(null);

export function CurrencyProvider({ currency, children }: { currency: CurrencyDTO; children: React.ReactNode }) {
  return <CurrencyContext.Provider value={currency}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyDTO {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}

export function useFormatMoney() {
  const currency = useCurrency();
  return (amount: number) => formatMoney(amount, currency);
}
