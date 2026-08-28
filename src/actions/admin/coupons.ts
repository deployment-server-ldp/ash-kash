"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

const schema = z.object({
  code: z.string().min(2),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  amount: z.coerce.number().default(0),
  minOrderAmount: z.string().optional(),
  maxDiscountAmount: z.string().optional(),
  appliesTo: z.enum(["ALL", "CATEGORY", "PRODUCT"]),
  categoryId: z.string().optional(),
  productId: z.string().optional(),
  firstOrderOnly: z.coerce.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  usageLimit: z.string().optional(),
  usageLimitPerCustomer: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveCoupon(id: string | null, formData: FormData) {
  await requireAdminAction("coupons", id ? "edit" : "create");
  const parsed = schema.parse(Object.fromEntries(formData.entries()));

  const data = {
    code: parsed.code.trim().toUpperCase(),
    type: parsed.type,
    amount: parsed.amount,
    minOrderAmount: parsed.minOrderAmount ? Number(parsed.minOrderAmount) : null,
    maxDiscountAmount: parsed.maxDiscountAmount ? Number(parsed.maxDiscountAmount) : null,
    appliesTo: parsed.appliesTo,
    categoryId: parsed.appliesTo === "CATEGORY" ? parsed.categoryId || null : null,
    productId: parsed.appliesTo === "PRODUCT" ? parsed.productId || null : null,
    firstOrderOnly: parsed.firstOrderOnly ?? false,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    usageLimit: parsed.usageLimit ? Number(parsed.usageLimit) : null,
    usageLimitPerCustomer: parsed.usageLimitPerCustomer ? Number(parsed.usageLimitPerCustomer) : null,
    isActive: parsed.isActive ?? false,
  };

  if (id) {
    await prisma.coupon.update({ where: { id }, data });
  } else {
    await prisma.coupon.create({ data });
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdminAction("coupons", "delete");
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}
