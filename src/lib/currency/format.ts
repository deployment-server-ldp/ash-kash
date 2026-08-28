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
