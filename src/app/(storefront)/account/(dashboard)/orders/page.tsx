import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getCurrencyByCodeMap } from "@/lib/currency/service";
import { formatOrderAmount } from "@/lib/currency/format";
import { StatusBadge } from "@/components/account/StatusBadge";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getSession();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const pageSize = 10;
  // Each order's total is stored in the currency it was actually placed in — show it as-is,
  // not re-converted into whatever currency the shopper happens to be browsing with now.
  const currencyMap = await getCurrencyByCodeMap();

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session!.sub },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId: session!.sub } }),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-noir/60">No orders yet.</p>
      ) : (
        <div className="divide-y divide-stone border border-stone">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.orderNumber}`}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-stone/50"
            >
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-xs text-noir/50">{order.createdAt.toLocaleDateString()}</p>
              </div>
              <StatusBadge status={order.status} />
              <span>{formatOrderAmount(Number(order.grandTotal), order.currencyCode, currencyMap)}</span>
            </Link>
          ))}
        </div>
      )}
      {total > pageSize ? (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          {Array.from({ length: Math.ceil(total / pageSize) }).map((_, i) => (
            <Link
              key={i}
              href={`/account/orders?page=${i + 1}`}
              className={i + 1 === page ? "font-medium underline" : "text-noir/60"}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
