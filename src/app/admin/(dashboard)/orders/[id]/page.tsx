import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { formatWithCurrency } from "@/lib/currency/format";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export const metadata: Metadata = { title: "Order Details" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("orders");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" }, include: { user: true } } },
  });
  if (!order) notFound();

  const currencyRow = await prisma.currency.findFirst({ where: { code: order.currencyCode } });
  const f = (n: number) =>
    currencyRow
      ? formatWithCurrency(n, {
          code: currencyRow.code,
          symbol: currencyRow.symbol,
          exchangeRate: Number(currencyRow.exchangeRate),
          decimalPlaces: currencyRow.decimalPlaces,
          symbolPosition: currencyRow.symbolPosition,
          thousandsSeparator: currencyRow.thousandsSeparator,
          decimalSeparator: currencyRow.decimalSeparator,
        })
      : n.toFixed(2);

  const address = order.shippingAddress as Record<string, string>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Order {order.orderNumber}</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/admin/orders/${order.id}/invoice`} target="_blank" className="btn-outline">
            Print Invoice
          </Link>
          <Link href={`/admin/orders/${order.id}/packing-slip`} target="_blank" className="btn-outline">
            Packing Slip
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="border border-stone bg-ivory p-6">
            <h2 className="mb-4 font-display text-lg">Items</h2>
            <ul className="divide-y divide-stone">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-3 text-sm">
                  <span>
                    {item.productName} {item.variantTitle ? `(${item.variantTitle})` : ""} × {item.quantity}
                  </span>
                  <span>{f(Number(item.totalPrice))}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-stone pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-noir/60">Subtotal</span>
                <span>{f(Number(order.subtotal))}</span>
              </div>
              {Number(order.discountTotal) > 0 ? (
                <div className="flex justify-between text-clay-600">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{f(Number(order.discountTotal))}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-noir/60">Shipping</span>
                <span>{f(Number(order.shippingTotal))}</span>
              </div>
              {Number(order.taxTotal) > 0 ? (
                <div className="flex justify-between">
                  <span className="text-noir/60">Tax</span>
                  <span>{f(Number(order.taxTotal))}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-stone pt-1 font-medium">
                <span>Total</span>
                <span>{f(Number(order.grandTotal))}</span>
              </div>
            </div>
          </div>

          <div className="border border-stone bg-ivory p-6">
            <h2 className="mb-4 font-display text-lg">Update Order</h2>
            <OrderStatusForm order={order} />
          </div>

          <div className="border border-stone bg-ivory p-6">
            <h2 className="mb-4 font-display text-lg">Timeline</h2>
            <ul className="space-y-3 border-l border-stone pl-4">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="font-medium">{h.status.replace(/_/g, " ")}</p>
                  <p className="text-xs text-noir/50">
                    {h.createdAt.toLocaleString()} {h.user ? `by ${h.user.name}` : ""}
                  </p>
                  {h.note ? <p className="text-noir/60">{h.note}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-stone bg-ivory p-6">
            <h2 className="mb-4 font-display text-lg">Customer</h2>
            <p className="text-sm">{order.customerName}</p>
            <p className="text-sm text-noir/60">{order.email}</p>
            <p className="text-sm text-noir/60">{order.phone}</p>
          </div>
          <div className="border border-stone bg-ivory p-6">
            <h2 className="mb-4 font-display text-lg">Shipping Address</h2>
            <div className="text-sm text-noir/70">
              <p>{address.addressLine1}</p>
              {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
              <p>
                {address.city}
                {address.state ? `, ${address.state}` : ""} {address.postalCode}
              </p>
              <p>{address.countryCode}</p>
            </div>
          </div>
          {order.notes ? (
            <div className="border border-stone bg-ivory p-6">
              <h2 className="mb-2 font-display text-lg">Customer Notes</h2>
              <p className="text-sm text-noir/70">{order.notes}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
