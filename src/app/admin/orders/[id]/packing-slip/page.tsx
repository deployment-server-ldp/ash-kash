import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getStoreSettings } from "@/lib/data/settings";

export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("orders");
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getStoreSettings(),
  ]);
  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string>;

  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-black print:p-0">
      <div className="mb-8 border-b border-black/20 pb-6">
        <h1 className="font-display text-2xl">{settings.storeName}</h1>
        <h2 className="mt-2 text-lg">Packing Slip — {order.orderNumber}</h2>
        <p className="text-sm text-black/60">{order.createdAt.toLocaleDateString()}</p>
      </div>

      <div className="mb-8 text-sm">
        <p className="mb-1 font-medium">Ship To</p>
        <p>{address.fullName ?? order.customerName}</p>
        <p>{address.addressLine1}</p>
        {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
        <p>
          {address.city}
          {address.state ? `, ${address.state}` : ""} {address.postalCode}
        </p>
        <p>{address.countryCode}</p>
        <p>{order.phone}</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/20 text-left">
            <th className="py-2">Item</th>
            <th className="py-2">SKU</th>
            <th className="py-2 text-right">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-black/10">
              <td className="py-2">
                {item.productName}
                {item.variantTitle ? <span className="text-black/50"> ({item.variantTitle})</span> : null}
              </td>
              <td className="py-2">{item.sku}</td>
              <td className="py-2 text-right">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-8 text-sm">Payment: Cash on Delivery — collect {order.grandTotal.toString()} {order.currencyCode} on delivery.</p>
      {order.notes ? <p className="mt-2 text-sm text-black/60">Customer notes: {order.notes}</p> : null}
    </div>
  );
}
