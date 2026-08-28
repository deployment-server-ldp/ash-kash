import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export const CART_COOKIE = "ak_cart";

/** Resolves (and lazily creates) the current cart for a logged-in user or guest session. */
export async function getOrCreateCart() {
  const session = await getSession();

  if (session) {
    const existing = await prisma.cart.findUnique({ where: { userId: session.sub } });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId: session.sub } });
  }

  const store = await cookies();
  let token = store.get(CART_COOKIE)?.value;

  if (token) {
    const existing = await prisma.cart.findUnique({ where: { sessionToken: token } });
    if (existing) return existing;
  }

  token = randomUUID();
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return prisma.cart.create({ data: { sessionToken: token } });
}

/** Read-only lookup of the current cart, without creating one. */
export async function getCurrentCart() {
  const session = await getSession();
  if (session) {
    return prisma.cart.findUnique({ where: { userId: session.sub } });
  }
  const store = await cookies();
  const token = store.get(CART_COOKIE)?.value;
  if (!token) return null;
  return prisma.cart.findUnique({ where: { sessionToken: token } });
}

/** Called right after login/register: merges the guest cart into the customer's cart. */
export async function mergeGuestCartIntoUser(userId: string) {
  const store = await cookies();
  const guestToken = store.get(CART_COOKIE)?.value;
  if (!guestToken) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionToken: guestToken },
    include: { items: true },
  });
  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) await prisma.cart.delete({ where: { id: guestCart.id } });
    return;
  }

  const userCart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  for (const item of guestCart.items) {
    await prisma.cartItem.upsert({
      where: {
        cartId_productId_productVariantId: {
          cartId: userCart.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
        },
      },
      create: {
        cartId: userCart.id,
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      },
      update: { quantity: { increment: item.quantity } },
    });
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  store.delete(CART_COOKIE);
}

export async function getCartWithItems(cartId: string) {
  return prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: {
      coupon: true,
      items: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
          productVariant: { include: { size: true, color: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
