import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getCurrencyByCodeMap } from "@/lib/currency/service";
import { formatOrderAmount } from "@/lib/currency/format";
import { StatusBadge } from "@/components/account/StatusBadge";

export const metadata: Metadata = { title: "Order Details" };

type Params = { orderNumber: string };

export default async function OrderDetailPage({ params }: { params: Promise<Params> }) {
  const { orderNumber } = await params;
  const session = await getSession();
  const currencyMap = await getCurrencyByCodeMap();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  if (!order || order.userId !== session!.sub) notFound();

  // The order's total is fixed in the currency it was placed in — never re-converted.
  const f = (n: number) => formatOrderAmount(n, order.currencyCode, currencyMap);
  const address = order.shippingAddress as Record<string, string>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl">Order {order.orderNumber}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-xl">Items</h2>
          <ul className="divide-y divide-stone border border-stone">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between px-4 py-3 text-sm">
                <span>
                  {item.productName} {item.variantTitle ? `(${item.variantTitle})` : ""} × {item.quantity}
                </span>
                <span>{f(Number(item.totalPrice))}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border border-stone p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-noir/60">Subtotal</span>
              <span>{f(Number(order.subtotal))}</span>
            </div>
            {Number(order.discountTotal) > 0 ? (
              <div className="flex justify-between text-clay-600">
                <span>Discount</span>
                <span>-{f(Number(order.discountTotal))}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-noir/60">Shipping</span>
              <span>{f(Number(order.shippingTotal))}</span>
            </div>
            <div className="flex justify-between border-t border-stone pt-1 font-medium">
              <span>Total</span>
              <span>{f(Number(order.grandTotal))}</span>
            </div>
          </div>

          {order.trackingNumber ? (
            <p className="mt-4 text-sm">
              Tracking Number: <strong>{order.trackingNumber}</strong>
              {order.trackingUrl ? (
                <a href={order.trackingUrl} className="ml-2 underline" target="_blank" rel="noreferrer">
                  Track Package
                </a>
              ) : null}
            </p>
          ) : null}
        </div>

        <div>
          <h2 className="mb-4 font-display text-xl">Shipping Address</h2>
          <div className="border border-stone p-4 text-sm text-noir/70">
            <p>{address.fullName}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
            <p>
              {address.city}
              {address.state ? `, ${address.state}` : ""} {address.postalCode}
            </p>
            <p>{address.countryCode}</p>
            <p>{address.phone}</p>
          </div>

          <h2 className="mb-4 mt-8 font-display text-xl">Order Timeline</h2>
          <ul className="space-y-3 border-l border-stone pl-4">
            {order.statusHistory.map((h) => (
              <li key={h.id} className="text-sm">
                <p className="font-medium">{h.status.replace(/_/g, " ")}</p>
                <p className="text-xs text-noir/50">{h.createdAt.toLocaleString()}</p>
                {h.note ? <p className="text-noir/60">{h.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
