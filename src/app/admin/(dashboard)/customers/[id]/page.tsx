import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { formatMoney } from "@/lib/currency/format";
import { StatusBadge } from "@/components/account/StatusBadge";

export const metadata: Metadata = { title: "Customer Details" };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("customers");
  const { id } = await params;
  const currency = await resolveCurrentCurrency();

  const customer = await prisma.user.findUnique({
    where: { id },
    include: { addresses: true, orders: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  const totalSpent = customer.orders
    .filter((o) => !["CANCELLED", "RETURNED", "REFUNDED"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.grandTotal), 0);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">{customer.name}</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-4 font-display text-lg">Orders</h2>
          <div className="divide-y divide-stone border border-stone bg-ivory">
            {customer.orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-stone/40"
              >
                <span>{o.orderNumber}</span>
                <StatusBadge status={o.status} />
                <span>{formatMoney(Number(o.grandTotal), currency)}</span>
              </Link>
            ))}
            {customer.orders.length === 0 ? <p className="p-4 text-sm text-noir/50">No orders yet.</p> : null}
          </div>
        </div>
        <div className="space-y-6">
          <div className="border border-stone bg-ivory p-6 text-sm">
            <p className="text-noir/60">Email</p>
            <p className="mb-3">{customer.email}</p>
            <p className="text-noir/60">Phone</p>
            <p className="mb-3">{customer.phone ?? "—"}</p>
            <p className="text-noir/60">Total Spent</p>
            <p className="text-lg font-medium">{formatMoney(totalSpent, currency)}</p>
          </div>
          <div className="border border-stone bg-ivory p-6">
            <h2 className="mb-3 font-display text-lg">Addresses</h2>
            {customer.addresses.map((a) => (
              <div key={a.id} className="mb-3 text-sm text-noir/70">
                <p className="font-medium text-noir">{a.label}</p>
                <p>{a.addressLine1}</p>
                <p>
                  {a.city}, {a.countryCode}
                </p>
              </div>
            ))}
            {customer.addresses.length === 0 ? <p className="text-sm text-noir/50">No addresses saved.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
