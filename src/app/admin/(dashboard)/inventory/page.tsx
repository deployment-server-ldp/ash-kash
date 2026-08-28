import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { InventoryAdjustForm } from "@/components/admin/InventoryAdjustForm";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireAdmin("inventory");
  const { filter } = await searchParams;

  const products = await prisma.product.findMany({
    where: { trackInventory: true },
    include: { variants: { where: { isActive: true } } },
    orderBy: { name: "asc" },
  });

  type Row = { productId: string; productName: string; variantId?: string; variantTitle?: string; sku: string; quantity: number; threshold: number };
  const rows: Row[] = [];

  for (const p of products) {
    if (p.variants.length > 0) {
      for (const v of p.variants) {
        rows.push({
          productId: p.id,
          productName: p.name,
          variantId: v.id,
          variantTitle: v.title ?? undefined,
          sku: v.sku,
          quantity: v.inventoryQuantity,
          threshold: p.lowStockThreshold,
        });
      }
    } else {
      rows.push({ productId: p.id, productName: p.name, sku: p.sku, quantity: p.inventoryQuantity, threshold: p.lowStockThreshold });
    }
  }

  const filtered = rows.filter((r) => {
    if (filter === "low") return r.quantity > 0 && r.quantity <= r.threshold;
    if (filter === "out") return r.quantity <= 0;
    return true;
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Inventory</h1>
      <div className="mb-4 flex gap-2 text-sm">
        <a href="?" className={`px-3 py-1.5 border border-stone ${!filter ? "bg-noir text-ivory" : ""}`}>
          All
        </a>
        <a href="?filter=low" className={`px-3 py-1.5 border border-stone ${filter === "low" ? "bg-noir text-ivory" : ""}`}>
          Low Stock
        </a>
        <a href="?filter=out" className={`px-3 py-1.5 border border-stone ${filter === "out" ? "bg-noir text-ivory" : ""}`}>
          Out of Stock
        </a>
      </div>

      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Product</th>
              <th className="p-3">Variant</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Stock</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-b border-stone/60">
                <td className="p-3">{r.productName}</td>
                <td className="p-3 text-noir/60">{r.variantTitle ?? "—"}</td>
                <td className="p-3">{r.sku}</td>
                <td className={`p-3 ${r.quantity <= 0 ? "text-red-600" : r.quantity <= r.threshold ? "text-amber-600" : ""}`}>
                  {r.quantity}
                </td>
                <td className="p-3">
                  <InventoryAdjustForm productId={r.productId} variantId={r.variantId} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-noir/50">
                  No matching inventory.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
