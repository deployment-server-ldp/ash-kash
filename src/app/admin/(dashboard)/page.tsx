import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardMetrics, resolveDateRange, type DateRangeKey } from "@/lib/data/analytics";
import { getDefaultCurrency, getCurrencyByCodeMap } from "@/lib/currency/service";
import { formatMoney, formatOrderAmount } from "@/lib/currency/format";
import { StatCard } from "@/components/admin/StatCard";
import { SalesTrendChart } from "@/components/admin/SalesTrendChart";
import { StatusBadge } from "@/components/account/StatusBadge";

export const metadata: Metadata = { title: "Dashboard" };

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "year", label: "This Year" },
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: DateRangeKey; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const rangeKey = sp.range ?? "30d";
  const range = resolveDateRange(rangeKey, sp.from, sp.to);
  const [metrics, currency, currencyMap] = await Promise.all([
    getDashboardMetrics(range),
    getDefaultCurrency(),
    getCurrencyByCodeMap(),
  ]);
  // Total sales / avg order value are normalized totals in the base currency; individual
  // recent-order amounts are shown in whatever currency each order was actually placed in.
  const f = (n: number) => formatMoney(n, currency);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <div className="flex gap-1 border border-stone bg-ivory p-1 text-sm">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/admin?range=${r.key}`}
              className={`px-3 py-1.5 ${rangeKey === r.key ? "bg-noir text-ivory" : "text-noir/60 hover:bg-stone"}`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={`Total Sales (${currency.code})`} value={f(metrics.totalSales)} tone="success" />
        <StatCard label="Orders" value={metrics.orderCount} />
        <StatCard label={`Avg. Order Value (${currency.code})`} value={f(metrics.avgOrderValue)} />
        <StatCard label="Pending Orders" value={metrics.pendingCount} tone={metrics.pendingCount > 0 ? "warning" : "default"} />
        <StatCard label="New Customers" value={metrics.customerCount} />
        <StatCard label="Products" value={metrics.productCount} />
        <StatCard label="Low Stock" value={metrics.lowStockCount} tone={metrics.lowStockCount > 0 ? "warning" : "default"} />
        <StatCard label="Out of Stock" value={metrics.outOfStockCount} tone={metrics.outOfStockCount > 0 ? "danger" : "default"} />
        <StatCard label="Delivered" value={metrics.deliveredCount} tone="success" />
      </div>

      <div className="mt-8 border border-stone bg-ivory p-6">
        <h2 className="mb-4 font-display text-lg">Revenue Trend</h2>
        <SalesTrendChart data={metrics.trend} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Recent Orders</h2>
          <div className="divide-y divide-stone">
            {metrics.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-stone/40"
              >
                <span className="font-medium">{order.orderNumber}</span>
                <StatusBadge status={order.status} />
                <span>{formatOrderAmount(Number(order.grandTotal), order.currencyCode, currencyMap)}</span>
              </Link>
            ))}
            {metrics.recentOrders.length === 0 ? <p className="py-4 text-sm text-noir/50">No orders yet.</p> : null}
          </div>
        </div>

        <div className="border border-stone bg-ivory p-6">
          <h2 className="mb-4 font-display text-lg">Best Selling Products</h2>
          <div className="divide-y divide-stone">
            {metrics.bestSellers.map((b, i) =>
              b.product ? (
                <div key={b.product.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{b.product.name}</span>
                  <span className="text-noir/50">{b.quantitySold} sold</span>
                </div>
              ) : (
                <div key={i} />
              )
            )}
            {metrics.bestSellers.length === 0 ? <p className="py-4 text-sm text-noir/50">No sales yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
