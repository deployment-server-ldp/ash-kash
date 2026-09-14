import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getCurrencyByCodeMap } from "@/lib/currency/service";
import { formatOrderAmount } from "@/lib/currency/format";
import { StatusBadge } from "@/components/account/StatusBadge";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountDashboardPage() {
  const session = await getSession();
  const currencyMap = await getCurrencyByCodeMap();
  const orders = await prisma.order.findMany({
    where: { userId: session!.sub },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl">Welcome, {session?.name.split(" ")[0]}</h1>
      <p className="mb-8 text-noir/60">Manage your orders, addresses, and account details.</p>

      <h2 className="mb-4 font-display text-xl">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-noir/60">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/shop" className="underline">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="divide-y divide-stone border border-stone">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.orderNumber}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-stone/50"
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
    </div>
  );
}
