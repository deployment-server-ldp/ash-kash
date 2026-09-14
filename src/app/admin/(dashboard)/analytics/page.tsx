import type { Metadata } from "next";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { resolveDateRange, type DateRangeKey } from "@/lib/data/analytics";
import { getDefaultCurrency } from "@/lib/currency/service";
import { formatMoney, toBaseAmount } from "@/lib/currency/format";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: DateRangeKey }> }) {
  await requireAdmin("analytics");
  const { range: rangeKey } = await searchParams;
  const range = resolveDateRange(rangeKey ?? "30d");
  const currency = await getDefaultCurrency();
  const f = (n: number) => formatMoney(n, currency);

  const activeFilter = {
    status: { notIn: ["CANCELLED", "RETURNED", "REFUNDED"] as OrderStatus[] },
    createdAt: { gte: range.start, lte: range.end },
  };

  // Orders can be placed in different currencies, and both grandTotal and each item's
  // totalPrice are stored in that order's own currency — a SQL SUM across orders would add
  // unlike units together. Pull the rows (with each order's checkout-time rate snapshot)
  // and normalize everything back to the base currency in JS before aggregating.
  const [byCurrency, orders] = await Promise.all([
    prisma.order.groupBy({ by: ["currencyCode"], where: activeFilter, _sum: { grandTotal: true }, _count: true }),
    prisma.order.findMany({
      where: activeFilter,
      select: {
        id: true,
        countryCode: true,
        grandTotal: true,
        exchangeRateSnapshot: true,
        items: { select: { productId: true, totalPrice: true } },
      },
    }),
  ]);

  const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.productId).filter((id): id is string => Boolean(id))))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, categoryId: true } });
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const prodCatMap = new Map(products.map((p) => [p.id, p.categoryId]));

  const salesByCategory = new Map<string, number>();
  const byCountry = new Map<string, { total: number; count: number }>();
  for (const o of orders) {
    const rate = Number(o.exchangeRateSnapshot);
    for (const item of o.items) {
      const catId = item.productId ? prodCatMap.get(item.productId) : null;
      const catName = catId ? catMap.get(catId) ?? "Uncategorized" : "Uncategorized";
      salesByCategory.set(catName, (salesByCategory.get(catName) ?? 0) + toBaseAmount(Number(item.totalPrice), rate));
    }
    const countryKey = o.countryCode ?? "Unknown";
    const countryEntry = byCountry.get(countryKey) ?? { total: 0, count: 0 };
    countryEntry.total += toBaseAmount(Number(o.grandTotal), rate);
    countryEntry.count += 1;
    byCountry.set(countryKey, countryEntry);
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Analytics</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Sales by Category ({currency.code})</h2>
          <ul className="space-y-2 text-sm">
            {[...salesByCategory.entries()].sort((a, b) => b[1] - a[1]).map(([name, total]) => (
              <li key={name} className="flex justify-between">
                <span>{name}</span>
                <span>{f(total)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Sales by Country ({currency.code})</h2>
          <ul className="space-y-2 text-sm">
            {[...byCountry.entries()].sort((a, b) => b[1].total - a[1].total).map(([country, c]) => (
              <li key={country} className="flex justify-between">
                <span>{country}</span>
                <span>
                  {f(c.total)} ({c.count})
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Sales by Currency</h2>
          <ul className="space-y-2 text-sm">
            {byCurrency.map((c) => (
              <li key={c.currencyCode} className="flex justify-between">
                <span>{c.currencyCode}</span>
                <span>
                  {Number(c._sum.grandTotal ?? 0).toFixed(2)} ({c._count})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-sm text-noir/50">
        For sales trends, best sellers, and order volume, see the <a href="/admin" className="underline">Dashboard</a>.
      </p>
    </div>
  );
}
