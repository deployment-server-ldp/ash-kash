import "server-only";
import { prisma } from "@/lib/prisma";

const ACTIVE_ORDER_FILTER = { status: { notIn: ["CANCELLED", "RETURNED", "REFUNDED"] as const } };

export type DateRangeKey = "today" | "7d" | "30d" | "90d" | "year" | "custom";

export function resolveDateRange(key: DateRangeKey, from?: string, to?: string): { start: Date; end: Date } {
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);
  const start = from ? new Date(from) : new Date();

  if (!from) {
    switch (key) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "7d":
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case "90d":
        start.setDate(start.getDate() - 89);
        start.setHours(0, 0, 0, 0);
        break;
      case "year":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      case "30d":
      default:
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
    }
  }

  return { start, end };
}

export async function getDashboardMetrics(range: { start: Date; end: Date }) {
  const dateFilter = { createdAt: { gte: range.start, lte: range.end } };

  const [
    totalSalesAgg,
    orderCount,
    pendingCount,
    deliveredCount,
    customerCount,
    productCount,
    trackedProducts,
    recentOrders,
    bestSellers,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { ...ACTIVE_ORDER_FILTER, ...dateFilter }, _sum: { grandTotal: true } }),
    prisma.order.count({ where: dateFilter }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED", ...dateFilter } }),
    prisma.user.count({ where: { userRole: "CUSTOMER", createdAt: dateFilter.createdAt } }),
    prisma.product.count(),
    prisma.product.findMany({
      where: { trackInventory: true },
      select: { inventoryQuantity: true, lowStockThreshold: true },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { not: null } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const lowStockCount = trackedProducts.filter(
    (p) => p.inventoryQuantity > 0 && p.inventoryQuantity <= p.lowStockThreshold
  ).length;
  const outOfStockCount = trackedProducts.filter((p) => p.inventoryQuantity <= 0).length;

  const bestSellerIds = bestSellers.map((b) => b.productId).filter((id): id is string => Boolean(id));
  const bestSellerProducts = bestSellerIds.length
    ? await prisma.product.findMany({ where: { id: { in: bestSellerIds } } })
    : [];
  const bestSellerMap = new Map(bestSellerProducts.map((p) => [p.id, p]));

  const totalSales = Number(totalSalesAgg._sum.grandTotal ?? 0);
  const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

  // daily trend
  const days: { date: string; total: number }[] = [];
  const cursor = new Date(range.start);
  const dayMs = 24 * 60 * 60 * 1000;
  const dayCount = Math.min(90, Math.round((range.end.getTime() - range.start.getTime()) / dayMs) + 1);

  const dailyTotals = await prisma.order.findMany({
    where: { ...ACTIVE_ORDER_FILTER, ...dateFilter },
    select: { grandTotal: true, createdAt: true },
  });
  const totalsByDay = new Map<string, number>();
  for (const o of dailyTotals) {
    const key = o.createdAt.toISOString().slice(0, 10);
    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + Number(o.grandTotal));
  }
  for (let i = 0; i < dayCount; i++) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ date: key, total: totalsByDay.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    totalSales,
    orderCount,
    pendingCount,
    deliveredCount,
    customerCount,
    productCount,
    lowStockCount,
    outOfStockCount,
    avgOrderValue,
    recentOrders,
    bestSellers: bestSellers.map((b) => ({
      product: b.productId ? bestSellerMap.get(b.productId) ?? null : null,
      quantitySold: b._sum.quantity ?? 0,
    })),
    trend: days,
  };
}
