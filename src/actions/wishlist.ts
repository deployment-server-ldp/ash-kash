"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

type ActionResult = { success: true; inWishlist?: boolean } | { success: false; error: string };

async function getOrCreateWishlist(userId: string) {
  return prisma.wishlist.upsert({ where: { userId }, create: { userId }, update: {} });
}

export async function toggleWishlist(productId: string, productVariantId?: string | null): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in to save items to your wishlist." };

  const wishlist = await getOrCreateWishlist(session.sub);
  const existing = await prisma.wishlistItem.findFirst({
    where: { wishlistId: wishlist.id, productId, productVariantId: productVariantId ?? null },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { success: true, inWishlist: false };
  }

  await prisma.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId, productVariantId: productVariantId ?? null },
  });
  revalidatePath("/wishlist");
  return { success: true, inWishlist: true };
}

export async function removeWishlistItem(itemId: string): Promise<ActionResult> {
  try {
    await prisma.wishlistItem.delete({ where: { id: itemId } });
    revalidatePath("/wishlist");
    return { success: true };
  } catch {
    return { success: false, error: "Could not remove item." };
  }
}
