import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { resolveDateRange, type DateRangeKey } from "@/lib/data/analytics";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { formatMoney } from "@/lib/currency/format";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: DateRangeKey }> }) {
  await requireAdmin("analytics");
  const { range: rangeKey } = await searchParams;
  const range = resolveDateRange(rangeKey ?? "30d");
  const currency = await resolveCurrentCurrency();
  const f = (n: number) => formatMoney(n, currency);

  const activeFilter = { status: { notIn: ["CANCELLED", "RETURNED", "REFUNDED"] as const }, createdAt: { gte: range.start, lte: range.end } };

  const [byCountry, byCurrency, orders] = await Promise.all([
    prisma.order.groupBy({ by: ["countryCode"], where: activeFilter, _sum: { grandTotal: true }, _count: true }),
    prisma.order.groupBy({ by: ["currencyCode"], where: activeFilter, _sum: { grandTotal: true }, _count: true }),
    prisma.order.findMany({ where: activeFilter, select: { id: true, items: { select: { productId: true, totalPrice: true } } } }),
  ]);

  const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.productId).filter((id): id is string => Boolean(id))))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, categoryId: true } });
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const prodCatMap = new Map(products.map((p) => [p.id, p.categoryId]));

  const salesByCategory = new Map<string, number>();
  for (const o of orders) {
    for (const item of o.items) {
      const catId = item.productId ? prodCatMap.get(item.productId) : null;
      const catName = catId ? catMap.get(catId) ?? "Uncategorized" : "Uncategorized";
      salesByCategory.set(catName, (salesByCategory.get(catName) ?? 0) + Number(item.totalPrice));
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Analytics</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Sales by Category</h2>
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
          <h2 className="mb-4 font-display text-lg">Sales by Country</h2>
          <ul className="space-y-2 text-sm">
            {byCountry.map((c) => (
              <li key={c.countryCode ?? "unknown"} className="flex justify-between">
                <span>{c.countryCode ?? "Unknown"}</span>
                <span>
                  {f(Number(c._sum.grandTotal ?? 0))} ({c._count})
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
