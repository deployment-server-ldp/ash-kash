import "server-only";
import { prisma } from "@/lib/prisma";
import { calculateCouponDiscount, isCouponCurrentlyValid } from "@/lib/coupon";
import { calculateShippingCost, resolveShippingMethodForCountry } from "@/lib/shipping";
import { getCartWithItems } from "@/lib/cart";

export type CartTotals = {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  freeShippingApplied: boolean;
  shippingMethodId: string | null;
  shippingMethodName: string | null;
  couponError: string | null;
  itemCount: number;
};

/** The single source of truth for pricing. Always recomputed from live DB data — never trusts the client. */
export async function computeCartTotals(cartId: string, countryCode: string | null, userId?: string | null): Promise<CartTotals> {
  const cart = await getCartWithItems(cartId);

  let subtotal = 0;
  let taxTotal = 0;
  const cartProductIds: string[] = [];
  const cartCategoryIds: string[] = [];

  for (const item of cart.items) {
    const unitPrice = Number(item.productVariant?.price ?? item.product.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    cartProductIds.push(item.productId);
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { categoryId: true, taxRate: true },
    });
    if (product?.categoryId) cartCategoryIds.push(product.categoryId);
    if (product?.taxRate) taxTotal += lineTotal * (Number(product.taxRate) / 100);
  }

  const settings = await prisma.storeSetting.findUnique({ where: { id: 1 } });
  if (!settings?.taxEnabled) taxTotal = 0;

  let discountTotal = 0;
  let couponError: string | null = null;
  let freeShippingApplied = false;

  if (cart.coupon) {
    let isFirstOrder = true;
    if (userId) {
      const priorOrders = await prisma.order.count({ where: { userId, status: { not: "CANCELLED" } } });
      isFirstOrder = priorOrders === 0;
    }
    const error = isCouponCurrentlyValid(cart.coupon, {
      subtotal,
      isFirstOrder,
      cartProductIds,
      cartCategoryIds,
    });
    if (error) {
      couponError = error;
    } else {
      if (cart.coupon.type === "FREE_SHIPPING") {
        freeShippingApplied = true;
      } else {
        discountTotal = calculateCouponDiscount(cart.coupon, subtotal);
      }
    }
  }

  const { method } = await resolveShippingMethodForCountry(countryCode);
  const shippingTotal = freeShippingApplied
    ? 0
    : calculateShippingCost(method, Math.max(0, subtotal - discountTotal));

  const grandTotal = Math.max(0, subtotal - discountTotal) + shippingTotal + taxTotal;

  return {
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    grandTotal,
    freeShippingApplied,
    shippingMethodId: method?.id ?? null,
    shippingMethodName: method?.name ?? null,
    couponError,
    itemCount: cart.items.reduce((n, i) => n + i.quantity, 0),
  };
}
