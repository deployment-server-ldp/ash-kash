import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getStoreSettings } from "@/lib/data/settings";
import { formatWithCurrency } from "@/lib/currency/format";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("orders");
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getStoreSettings(),
  ]);
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
    <div className="mx-auto max-w-2xl bg-white p-10 text-black print:p-0">
      <div className="mb-8 flex items-start justify-between border-b border-black/20 pb-6">
        <div>
          {settings.logoUrl ? (
            <Image src={settings.logoUrl} alt={settings.storeName} width={160} height={56} className="mb-2 h-10 w-auto" />
          ) : (
            <h1 className="font-display text-2xl">{settings.storeName}</h1>
          )}
          {settings.contactAddress ? <p className="text-sm text-black/60">{settings.contactAddress}</p> : null}
          {settings.contactEmail ? <p className="text-sm text-black/60">{settings.contactEmail}</p> : null}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-medium">Invoice</h2>
          <p className="text-sm text-black/60">{order.orderNumber}</p>
          <p className="text-sm text-black/60">{order.createdAt.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="mb-1 font-medium">Bill To</p>
          <p>{order.customerName}</p>
          <p>{address.addressLine1}</p>
          {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
          <p>
            {address.city}
            {address.state ? `, ${address.state}` : ""} {address.postalCode}
          </p>
          <p>{address.countryCode}</p>
          <p>{order.phone}</p>
        </div>
        <div className="text-right">
          <p className="mb-1 font-medium">Payment Method</p>
          <p>Cash on Delivery</p>
          <p className="mt-3 mb-1 font-medium">Status</p>
          <p>{order.status.replace(/_/g, " ")}</p>
        </div>
      </div>

      <table className="mb-8 w-full text-sm">
        <thead>
          <tr className="border-b border-black/20 text-left">
            <th className="py-2">Item</th>
            <th className="py-2">Qty</th>
            <th className="py-2 text-right">Unit Price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-black/10">
              <td className="py-2">
                {item.productName}
                {item.variantTitle ? <span className="text-black/50"> ({item.variantTitle})</span> : null}
              </td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2 text-right">{f(Number(item.unitPrice))}</td>
              <td className="py-2 text-right">{f(Number(item.totalPrice))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{f(Number(order.subtotal))}</span>
        </div>
        {Number(order.discountTotal) > 0 ? (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{f(Number(order.discountTotal))}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{f(Number(order.shippingTotal))}</span>
        </div>
        {Number(order.taxTotal) > 0 ? (
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{f(Number(order.taxTotal))}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-black/20 pt-1 font-medium">
          <span>Total</span>
          <span>{f(Number(order.grandTotal))}</span>
        </div>
      </div>
    </div>
  );
}
