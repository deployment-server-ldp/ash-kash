import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getCurrencyByCodeMap } from "@/lib/currency/service";
import { formatOrderAmount } from "@/lib/currency/format";
import { StatusBadge } from "@/components/account/StatusBadge";
import type { OrderStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Orders" };
const PAGE_SIZE = 20;

type SP = { q?: string; status?: string; page?: string };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin("orders");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  // Each order was placed in — and its total stored in — its own currency, captured at
  // checkout. Show it as-is rather than re-converting it into whatever currency the
  // admin happens to be browsing the storefront with right now.
  const currencyMap = await getCurrencyByCodeMap();

  const where = {
    ...(sp.q
      ? { OR: [{ orderNumber: { contains: sp.q } }, { customerName: { contains: sp.q } }, { phone: { contains: sp.q } }] }
      : {}),
    ...(sp.status ? { status: sp.status as OrderStatus } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Orders</h1>

      <form method="get" className="mb-4 flex flex-wrap gap-3">
        <input name="q" defaultValue={sp.q} placeholder="Search order #, name, phone" className="input max-w-sm" />
        <select name="status" defaultValue={sp.status ?? ""} className="input max-w-[180px]">
          <option value="">All Statuses</option>
          {["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"].map(
            (s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            )
          )}
        </select>
        <button type="submit" className="btn-outline">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-stone/60 hover:bg-stone/30">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-3">
                  {o.customerName}
                  <br />
                  <span className="text-xs text-noir/50">{o.phone}</span>
                </td>
                <td className="p-3">{o._count.items}</td>
                <td className="p-3">{formatOrderAmount(Number(o.grandTotal), o.currencyCode, currencyMap)}</td>
                <td className="p-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="p-3 text-noir/50">{o.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-noir/50">
                  No orders found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE ? (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: Math.ceil(total / PAGE_SIZE) }).map((_, i) => (
            <Link key={i} href={`/admin/orders?page=${i + 1}`} className={i + 1 === page ? "font-medium underline" : "text-noir/60"}>
              {i + 1}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
