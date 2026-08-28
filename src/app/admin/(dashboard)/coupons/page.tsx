import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { can } from "@/lib/auth/rbac";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCoupon } from "@/actions/admin/coupons";

export const metadata: Metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const session = await requireAdmin("coupons");
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Coupons</h1>
        {can(session.role, "coupons", "create") ? (
          <Link href="/admin/coupons/new" className="btn-primary">
            Add Coupon
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Used</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-stone/60">
                <td className="p-3 font-medium">{c.code}</td>
                <td className="p-3 text-noir/60">{c.type.replace("_", " ")}</td>
                <td className="p-3">{c.type === "FREE_SHIPPING" ? "—" : c.type === "PERCENTAGE" ? `${c.amount}%` : Number(c.amount).toFixed(2)}</td>
                <td className="p-3">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="p-3">{c.endDate ? c.endDate.toLocaleDateString() : "—"}</td>
                <td className="p-3">{c.isActive ? "Active" : "Inactive"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/coupons/${c.id}`} className="text-xs uppercase tracking-wide underline">
                      Edit
                    </Link>
                    {can(session.role, "coupons", "delete") ? <DeleteButton action={deleteCoupon.bind(null, c.id)} /> : null}
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-noir/50">
                  No coupons yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
