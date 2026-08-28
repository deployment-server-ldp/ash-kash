import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "Add Coupon" };

export default async function NewCouponPage() {
  await requireAdmin("coupons", "create");
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Add Coupon</h1>
      <CouponForm coupon={null} categories={categories} products={products} />
    </div>
  );
}
