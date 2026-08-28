import type { Coupon } from "@prisma/client";

export type CouponValidationContext = {
  subtotal: number;
  isFirstOrder: boolean;
  cartProductIds: string[];
  cartCategoryIds: string[];
};

export function isCouponCurrentlyValid(coupon: Coupon, ctx: CouponValidationContext): string | null {
  if (!coupon.isActive) return "This coupon is no longer active.";
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) return "This coupon is not active yet.";
  if (coupon.endDate && now > coupon.endDate) return "This coupon has expired.";
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return "This coupon has reached its usage limit.";
  }
  if (coupon.firstOrderOnly && !ctx.isFirstOrder) {
    return "This coupon is valid for first orders only.";
  }
  if (coupon.minOrderAmount && ctx.subtotal < Number(coupon.minOrderAmount)) {
    return `Minimum order amount for this coupon is ${Number(coupon.minOrderAmount)}.`;
  }
  if (coupon.appliesTo === "CATEGORY" && coupon.categoryId) {
    if (!ctx.cartCategoryIds.includes(coupon.categoryId)) {
      return "This coupon does not apply to items in your cart.";
    }
  }
  if (coupon.appliesTo === "PRODUCT" && coupon.productId) {
    if (!ctx.cartProductIds.includes(coupon.productId)) {
      return "This coupon does not apply to items in your cart.";
    }
  }
  return null;
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  let discount = 0;
  if (coupon.type === "PERCENTAGE") {
    discount = (subtotal * Number(coupon.amount)) / 100;
  } else if (coupon.type === "FIXED") {
    discount = Number(coupon.amount);
  } else if (coupon.type === "FREE_SHIPPING") {
    discount = 0;
  }
  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, Number(coupon.maxDiscountAmount));
  }
  return Math.max(0, Math.min(discount, subtotal));
}
