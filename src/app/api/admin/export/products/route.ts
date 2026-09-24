import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getDefaultCurrency } from "@/lib/currency/service";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  await requireAdmin("products");

  const [products, currency] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
    }),
    getDefaultCurrency(),
  ]);

  const csv = toCsv(
    products.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: p.category?.name ?? "",
      brand: p.brand?.name ?? "",
      price: Number(p.price).toFixed(2),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice).toFixed(2) : "",
      stock: p.trackInventory ? p.inventoryQuantity : "Not tracked",
      status: p.status,
    })),
    [
      { key: "name", label: "Name" },
      { key: "sku", label: "SKU" },
      { key: "category", label: "Category" },
      { key: "brand", label: "Brand" },
      { key: "price", label: `Price (${currency.code})` },
      { key: "compareAtPrice", label: `Compare-at Price (${currency.code})` },
      { key: "stock", label: "Stock" },
      { key: "status", label: "Status" },
    ]
  );

  return csvResponse(csv, `products-${new Date().toISOString().slice(0, 10)}.csv`);
}
