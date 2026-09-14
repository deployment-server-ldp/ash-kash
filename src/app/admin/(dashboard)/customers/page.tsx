import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getDefaultCurrency } from "@/lib/currency/service";
import { formatMoney, toBaseAmount } from "@/lib/currency/format";

export const metadata: Metadata = { title: "Customers" };
const PAGE_SIZE = 20;

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdmin("customers");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const currency = await getDefaultCurrency();

  const where = {
    userRole: "CUSTOMER" as const,
    ...(sp.q ? { OR: [{ name: { contains: sp.q } }, { email: { contains: sp.q } }] } : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  // Orders can be placed in different currencies, and grandTotal is stored in each order's
  // own currency — so a plain SQL SUM across orders would add unlike units together. Pull
  // each order's amount + the exchange rate snapshot from checkout time and normalize back
  // to the base currency before summing.
  const customerOrders = await prisma.order.findMany({
    where: { userId: { in: customers.map((c) => c.id) }, status: { notIn: ["CANCELLED", "RETURNED", "REFUNDED"] } },
    select: { userId: true, grandTotal: true, exchangeRateSnapshot: true },
  });
  const totalMap = new Map<string, number>();
  for (const o of customerOrders) {
    if (!o.userId) continue;
    const base = toBaseAmount(Number(o.grandTotal), Number(o.exchangeRateSnapshot));
    totalMap.set(o.userId, (totalMap.get(o.userId) ?? 0) + base);
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Customers</h1>
      <form method="get" className="mb-4 flex gap-3">
        <input name="q" defaultValue={sp.q} placeholder="Search by name or email" className="input max-w-sm" />
        <button type="submit" className="btn-outline">
          Search
        </button>
      </form>
      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total Spent ({currency.code})</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-stone/60">
                <td className="p-3">
                  <Link href={`/admin/customers/${c.id}`} className="font-medium underline">
                    {c.name}
                  </Link>
                </td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone ?? "—"}</td>
                <td className="p-3">{c._count.orders}</td>
                <td className="p-3">{formatMoney(totalMap.get(c.id) ?? 0, currency)}</td>
                <td className="p-3 text-noir/50">{c.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-noir/50">
                  No customers found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {total > PAGE_SIZE ? (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: Math.ceil(total / PAGE_SIZE) }).map((_, i) => (
            <Link key={i} href={`/admin/customers?page=${i + 1}`} className={i + 1 === page ? "font-medium underline" : "text-noir/60"}>
              {i + 1}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
