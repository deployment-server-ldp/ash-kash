import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { CurrencyLike } from "./format";

export const CURRENCY_COOKIE = "ak_currency";
const COUNTRY_COOKIE = "ak_country";

export type CurrencyDTO = CurrencyLike & { id: string; name: string; isDefault: boolean };

function toDTO(c: {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: unknown;
  decimalPlaces: number;
  symbolPosition: "BEFORE" | "AFTER";
  thousandsSeparator: string;
  decimalSeparator: string;
  isDefault: boolean;
}): CurrencyDTO {
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    symbol: c.symbol,
    exchangeRate: Number(c.exchangeRate),
    decimalPlaces: c.decimalPlaces,
    symbolPosition: c.symbolPosition,
    thousandsSeparator: c.thousandsSeparator,
    decimalSeparator: c.decimalSeparator,
    isDefault: c.isDefault,
  };
}

const FALLBACK_CURRENCY: CurrencyDTO = {
  id: "fallback",
  name: "Pakistani Rupee",
  code: "PKR",
  symbol: "Rs.",
  exchangeRate: 1,
  decimalPlaces: 0,
  symbolPosition: "BEFORE",
  thousandsSeparator: ",",
  decimalSeparator: ".",
  isDefault: true,
};

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // refresh live rates at most once a day
let syncInFlight = false;

/** Fires a background live-rate refresh if the non-default currencies look stale. Never blocks the request. */
function maybeAutoSyncRates(currencies: { isDefault: boolean; updatedAt: Date }[]) {
  if (syncInFlight) return;
  const others = currencies.filter((c) => !c.isDefault);
  if (others.length === 0) return;
  let oldest = others[0]!.updatedAt;
  for (const c of others) if (c.updatedAt < oldest) oldest = c.updatedAt;
  if (Date.now() - oldest.getTime() < SYNC_INTERVAL_MS) return;

  syncInFlight = true;
  import("./sync")
    .then(({ syncExchangeRates }) => syncExchangeRates())
    .catch(() => {})
    .finally(() => {
      syncInFlight = false;
    });
}

/** Cached per-request: all active currencies. */
export const getActiveCurrencies = cache(async (): Promise<CurrencyDTO[]> => {
  const currencies = await prisma.currency.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
  if (currencies.length === 0) return [FALLBACK_CURRENCY];
  maybeAutoSyncRates(currencies);
  return currencies.map(toDTO);
});

export const getDefaultCurrency = cache(async (): Promise<CurrencyDTO> => {
  const currency = await prisma.currency.findFirst({ where: { isDefault: true, isActive: true } });
  return currency ? toDTO(currency) : FALLBACK_CURRENCY;
});

/**
 * Every currency (active or not) keyed by code, for formatting historical records — like
 * orders — in their own stored currency rather than the currently active/browsing one.
 */
export const getCurrencyByCodeMap = cache(async (): Promise<Map<string, CurrencyDTO>> => {
  const currencies = await prisma.currency.findMany();
  return new Map(currencies.map((c) => [c.code, toDTO(c)]));
});

async function getCurrencyForCountry(iso2: string): Promise<CurrencyDTO | null> {
  const country = await prisma.country.findUnique({
    where: { iso2: iso2.toUpperCase() },
    include: { currency: true },
  });
  if (country?.currency && country.currency.isActive) return toDTO(country.currency);
  return null;
}

/** Resolves the visitor's current display currency: manual choice > country mapping > default. */
export const resolveCurrentCurrency = cache(async (): Promise<CurrencyDTO> => {
  const store = await cookies();
  const manualCode = store.get(CURRENCY_COOKIE)?.value;
  if (manualCode) {
    const match = await prisma.currency.findFirst({
      where: { code: manualCode.toUpperCase(), isActive: true },
    });
    if (match) return toDTO(match);
  }

  const country = store.get(COUNTRY_COOKIE)?.value;
  if (country) {
    const byCountry = await getCurrencyForCountry(country);
    if (byCountry) return byCountry;
  }

  return getDefaultCurrency();
});
