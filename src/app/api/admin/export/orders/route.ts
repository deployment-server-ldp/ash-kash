import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  await requireAdmin("orders");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  const csv = toCsv(
    orders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      phone: o.phone,
      email: o.email ?? "",
      items: o._count.items,
      currency: o.currencyCode,
      total: Number(o.grandTotal).toFixed(2),
      status: o.status,
      paymentStatus: o.paymentStatus,
      country: o.countryCode,
      date: o.createdAt.toISOString().slice(0, 10),
    })),
    [
      { key: "orderNumber", label: "Order #" },
      { key: "customerName", label: "Customer" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "items", label: "Items" },
      { key: "currency", label: "Currency" },
      { key: "total", label: "Total" },
      { key: "status", label: "Status" },
      { key: "paymentStatus", label: "Payment Status" },
      { key: "country", label: "Country" },
      { key: "date", label: "Date" },
    ]
  );

  return csvResponse(csv, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
}
