import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "Edit Coupon" };

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("coupons", "edit");
  const { id } = await params;
  const [coupon, categories, products] = await Promise.all([
    prisma.coupon.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!coupon) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Edit Coupon</h1>
      <CouponForm coupon={coupon} categories={categories} products={products} />
    </div>
  );
}
