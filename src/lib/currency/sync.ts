import "server-only";
import { prisma } from "@/lib/prisma";

const RATE_API = "https://open.er-api.com/v6/latest";

export type SyncResult = { updated: string[]; skipped: string[]; error?: string };

/**
 * Fetches live market rates against the store's default currency and updates every
 * active, non-default currency that has autoUpdate enabled. Free provider, no API key,
 * rates refresh daily upstream (https://www.exchangerate-api.com/docs/free).
 */
export async function syncExchangeRates(): Promise<SyncResult> {
  const base = await prisma.currency.findFirst({ where: { isDefault: true } });
  if (!base) return { updated: [], skipped: [], error: "No default currency is set." };

  if (Number(base.exchangeRate) !== 1) {
    await prisma.currency.update({ where: { id: base.id }, data: { exchangeRate: 1 } });
  }

  let payload: { result?: string; rates?: Record<string, number> };
  try {
    const res = await fetch(`${RATE_API}/${base.code}`, { cache: "no-store" });
    payload = await res.json();
  } catch {
    return { updated: [], skipped: [], error: "Could not reach the exchange rate provider." };
  }
  if (payload.result !== "success" || !payload.rates) {
    return { updated: [], skipped: [], error: "Exchange rate provider returned an unexpected response." };
  }
  const rates = payload.rates;

  const others = await prisma.currency.findMany({ where: { isDefault: false, isActive: true } });
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const currency of others) {
    const rate = rates[currency.code];
    if (!currency.autoUpdate || !rate) {
      skipped.push(currency.code);
      continue;
    }
    await prisma.currency.update({ where: { id: currency.id }, data: { exchangeRate: rate } });
    await prisma.exchangeRate.create({ data: { currencyId: currency.id, rate, source: "api:open.er-api.com" } });
    updated.push(currency.code);
  }

  return { updated, skipped };
}
