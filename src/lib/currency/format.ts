export type CurrencyLike = {
  code: string;
  symbol: string;
  exchangeRate: number | string;
  decimalPlaces: number;
  symbolPosition: "BEFORE" | "AFTER";
  thousandsSeparator: string;
  decimalSeparator: string;
};

/** Converts a base-currency amount into the given display currency (pure, no I/O). */
export function convertAmount(baseAmount: number, currency: CurrencyLike): number {
  const rate = Number(currency.exchangeRate);
  const converted = baseAmount * rate;
  const factor = 10 ** currency.decimalPlaces;
  return Math.round(converted * factor) / factor;
}

function groupThousands(intPart: string, separator: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/** Formats a number using a currency's own separators/decimal places/symbol placement. */
export function formatWithCurrency(amount: number, currency: CurrencyLike): string {
  const fixed = amount.toFixed(currency.decimalPlaces);
  const [intPartRaw, decPart] = fixed.split(".");
  const intPart = groupThousands(intPartRaw ?? "0", currency.thousandsSeparator);
  const numberStr = decPart ? `${intPart}${currency.decimalSeparator}${decPart}` : intPart;
  return currency.symbolPosition === "BEFORE"
    ? `${currency.symbol}${numberStr}`
    : `${numberStr}${currency.symbol}`;
}

/** Converts a base-currency amount and formats it for display, in one step. */
export function formatMoney(baseAmount: number, currency: CurrencyLike): string {
  return formatWithCurrency(convertAmount(baseAmount, currency), currency);
}

/**
 * Recovers the base-currency amount from a value that was already converted at some
 * point in the past (e.g. an order total, converted and stored using the exchange rate
 * in effect at checkout time). The inverse of convertAmount.
 */
export function toBaseAmount(convertedAmount: number, exchangeRateSnapshot: number): number {
  return exchangeRateSnapshot > 0 ? convertedAmount / exchangeRateSnapshot : convertedAmount;
}

/** Formats an amount that is already in its own currency's units — no conversion applied. */
export function formatOrderAmount(amount: number, currencyCode: string, currencyMap: Map<string, CurrencyLike>): string {
  const currency = currencyMap.get(currencyCode);
  return currency ? formatWithCurrency(amount, currency) : `${amount.toFixed(2)} ${currencyCode}`;
}
