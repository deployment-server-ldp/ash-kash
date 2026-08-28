"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

const schema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  adjustment: z.coerce.number().int(),
  note: z.string().optional(),
});

export async function adjustInventory(formData: FormData) {
  const session = await requireAdminAction("inventory", "edit");
  const parsed = schema.parse(Object.fromEntries(formData.entries()));

  if (parsed.variantId) {
    const variant = await prisma.productVariant.update({
      where: { id: parsed.variantId },
      data: { inventoryQuantity: { increment: parsed.adjustment } },
    });
    await prisma.inventoryHistory.create({
      data: {
        productId: parsed.productId,
        productVariantId: parsed.variantId,
        userId: session.sub,
        type: parsed.adjustment >= 0 ? "INCREASE" : "DECREASE",
        quantityChange: parsed.adjustment,
        quantityAfter: variant.inventoryQuantity,
        note: parsed.note || "Manual adjustment",
      },
    });
  } else {
    const product = await prisma.product.update({
      where: { id: parsed.productId },
      data: { inventoryQuantity: { increment: parsed.adjustment } },
    });
    await prisma.inventoryHistory.create({
      data: {
        productId: parsed.productId,
        userId: session.sub,
        type: parsed.adjustment >= 0 ? "INCREASE" : "DECREASE",
        quantityChange: parsed.adjustment,
        quantityAfter: product.inventoryQuantity,
        note: parsed.note || "Manual adjustment",
      },
    });
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
}
