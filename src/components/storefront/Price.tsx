import { resolveCurrentCurrency } from "@/lib/currency/service";
import { formatMoney } from "@/lib/currency/format";

export async function Price({
  amount,
  compareAt,
  className,
}: {
  amount: number;
  compareAt?: number | null;
  className?: string;
}) {
  const currency = await resolveCurrentCurrency();
  const hasDiscount = compareAt && compareAt > amount;

  return (
    <span className={className}>
      <span className="font-medium">{formatMoney(amount, currency)}</span>
      {hasDiscount ? (
        <span className="ml-2 text-noir/40 line-through">{formatMoney(compareAt, currency)}</span>
      ) : null}
    </span>
  );
}
