import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { can } from "@/lib/auth/rbac";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { formatMoney } from "@/lib/currency/format";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProduct } from "@/actions/admin/products";

export const metadata: Metadata = { title: "Products" };
const PLACEHOLDER = "/images/placeholder-product.svg";
const PAGE_SIZE = 20;

type SP = { q?: string; status?: string; page?: string };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await requireAdmin("products");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const currency = await resolveCurrentCurrency();

  const where = {
    ...(sp.q ? { OR: [{ name: { contains: sp.q } }, { sku: { contains: sp.q } }] } : {}),
    ...(sp.status ? { status: sp.status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        {can(session.role, "products", "create") ? (
          <Link href="/admin/products/new" className="btn-primary">
            Add Product
          </Link>
        ) : null}
      </div>

      <form method="get" className="mb-4 flex gap-3">
        <input name="q" defaultValue={sp.q} placeholder="Search by name or SKU" className="input max-w-sm" />
        <select name="status" defaultValue={sp.status ?? ""} className="input max-w-[160px]">
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button type="submit" className="btn-outline">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone/60">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden bg-stone">
                      <Image src={p.images[0]?.url ?? PLACEHOLDER} alt={p.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-noir/50">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-noir/60">{p.category?.name ?? "—"}</td>
                <td className="p-3">{formatMoney(Number(p.price), currency)}</td>
                <td className="p-3">{p.trackInventory ? p.inventoryQuantity : "Not tracked"}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/products/${p.id}`} className="text-xs uppercase tracking-wide underline">
                      Edit
                    </Link>
                    {can(session.role, "products", "delete") ? <DeleteButton action={deleteProduct.bind(null, p.id)} /> : null}
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-noir/50">
                  No products found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE ? (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: Math.ceil(total / PAGE_SIZE) }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/products?page=${i + 1}${sp.q ? `&q=${sp.q}` : ""}`}
              className={i + 1 === page ? "font-medium underline" : "text-noir/60"}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
