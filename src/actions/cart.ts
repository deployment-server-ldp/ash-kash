"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

type ActionResult = { success: true } | { success: false; error: string };

const addSchema = z.object({
  productId: z.string().min(1),
  productVariantId: z.string().min(1).optional().nullable(),
  quantity: z.number().int().min(1).max(20).default(1),
});

async function assertStockAvailable(productId: string, variantId: string | null | undefined, requestedQty: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") throw new Error("This product is no longer available.");

  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || !variant.isActive) throw new Error("This variant is no longer available.");
    if (product.trackInventory && variant.inventoryQuantity < requestedQty) {
      throw new Error("Not enough stock available for this size/color.");
    }
  } else {
    if (product.trackInventory && product.inventoryQuantity < requestedQty) {
      throw new Error("Not enough stock available.");
    }
  }
}

export async function addToCart(input: z.infer<typeof addSchema>): Promise<ActionResult> {
  try {
    const data = addSchema.parse(input);
    const variantId = data.productVariantId ?? null;

    const hasVariants = await prisma.productVariant.count({ where: { productId: data.productId } });
    if (hasVariants > 0 && !variantId) {
      return { success: false, error: "Please select a size and color." };
    }

    const cart = await getOrCreateCart();
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: data.productId, productVariantId: variantId },
    });

    const nextQty = (existing?.quantity ?? 0) + data.quantity;
    await assertStockAvailable(data.productId, variantId, nextQty);

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: data.productId, productVariantId: variantId, quantity: data.quantity },
      });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Could not add to bag." };
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<ActionResult> {
  try {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      revalidatePath("/", "layout");
      return { success: true };
    }
    const item = await prisma.cartItem.findUniqueOrThrow({ where: { id: itemId } });
    await assertStockAvailable(item.productId, item.productVariantId, quantity);
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Could not update quantity." };
  }
}

export async function removeCartItem(itemId: string): Promise<ActionResult> {
  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Could not remove item." };
  }
}

export async function applyCoupon(code: string): Promise<ActionResult> {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!coupon) return { success: false, error: "Invalid coupon code." };
    const cart = await getOrCreateCart();
    await prisma.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } });
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Could not apply coupon." };
  }
}

export async function removeCoupon(): Promise<ActionResult> {
  try {
    const cart = await getOrCreateCart();
    await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Could not remove coupon." };
  }
}
