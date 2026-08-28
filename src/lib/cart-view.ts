import "server-only";
import { cookies } from "next/headers";
import { getCurrentCart, getCartWithItems } from "@/lib/cart";
import { computeCartTotals } from "@/lib/pricing";
import { getSession } from "@/lib/auth/session";

export type CartItemVM = {
  id: string;
  productId: string;
  productVariantId: string | null;
  name: string;
  slug: string;
  image: string | null;
  variantTitle: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  maxQuantity: number;
};

export type CartViewData = {
  items: CartItemVM[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  couponCode: string | null;
  couponError: string | null;
  freeShippingApplied: boolean;
};

const COUNTRY_COOKIE = "ak_country";

export async function getCartViewData(): Promise<CartViewData> {
  const cart = await getCurrentCart();
  if (!cart) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      discountTotal: 0,
      shippingTotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      couponCode: null,
      couponError: null,
      freeShippingApplied: false,
    };
  }

  const full = await getCartWithItems(cart.id);
  const store = await cookies();
  const countryCode = store.get(COUNTRY_COOKIE)?.value ?? null;
  const session = await getSession();
  const totals = await computeCartTotals(cart.id, countryCode, session?.sub ?? null);

  const items: CartItemVM[] = full.items.map((item) => {
    const unitPrice = Number(item.productVariant?.price ?? item.product.price);
    const maxQuantity = item.product.trackInventory
      ? item.productVariant
        ? item.productVariant.inventoryQuantity
        : item.product.inventoryQuantity
      : 999;
    return {
      id: item.id,
      productId: item.productId,
      productVariantId: item.productVariantId,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0]?.url ?? null,
      variantTitle: item.productVariant?.title ?? null,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
      maxQuantity,
    };
  });

  return {
    items,
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    shippingTotal: totals.shippingTotal,
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    couponCode: full.coupon?.code ?? null,
    couponError: totals.couponError,
    freeShippingApplied: totals.freeShippingApplied,
  };
}
