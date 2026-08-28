import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatWithCurrency } from "@/lib/currency/format";

export const metadata: Metadata = { title: "Order Confirmed" };

type Params = { orderNumber: string };

export default async function ConfirmationPage({ params }: { params: Promise<Params> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  const currency = await prisma.currency.findFirst({ where: { code: order.currencyCode } });
  const f = (n: number) =>
    currency
      ? formatWithCurrency(n, {
          code: currency.code,
          symbol: currency.symbol,
          exchangeRate: Number(currency.exchangeRate),
          decimalPlaces: currency.decimalPlaces,
          symbolPosition: currency.symbolPosition,
          thousandsSeparator: currency.thousandsSeparator,
          decimalSeparator: currency.decimalSeparator,
        })
      : n.toFixed(2);

  return (
    <div className="container-boutique max-w-2xl py-16 text-center">
      <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-clay-600" />
      <h1 className="font-display text-3xl">Thank You, {order.customerName.split(" ")[0]}!</h1>
      <p className="mt-3 text-noir/60">
        Your order has been placed and will be paid for via Cash on Delivery. A confirmation has been recorded for
        order <strong>{order.orderNumber}</strong>.
      </p>

      <div className="mt-10 border border-stone p-6 text-left">
        <div className="mb-4 flex justify-between text-sm">
          <span className="text-noir/60">Order Number</span>
          <span className="font-medium">{order.orderNumber}</span>
        </div>
        <div className="mb-4 flex justify-between text-sm">
          <span className="text-noir/60">Payment Method</span>
          <span>Cash on Delivery</span>
        </div>
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
        <div className="mt-4 flex justify-between border-t border-stone pt-3 text-base font-medium">
          <span>Total</span>
          <span>{f(Number(order.grandTotal))}</span>
        </div>
      </div>

      <Link href="/shop" className="btn-primary mt-8 inline-flex">
        Continue Shopping
      </Link>
    </div>
  );
}
