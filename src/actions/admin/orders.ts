"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

const statusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
  ]),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  internalNotes: z.string().optional(),
});

export async function updateOrderStatus(formData: FormData) {
  const session = await requireAdminAction("orders", "edit");
  const parsed = statusSchema.parse(Object.fromEntries(formData.entries()));

  const previous = await prisma.order.findUniqueOrThrow({ where: { id: parsed.orderId } });

  await prisma.order.update({
    where: { id: parsed.orderId },
    data: {
      status: parsed.status,
      trackingNumber: parsed.trackingNumber || null,
      trackingUrl: parsed.trackingUrl || null,
      internalNotes: parsed.internalNotes || null,
    },
  });

  if (previous.status !== parsed.status || parsed.note) {
    await prisma.orderStatusHistory.create({
      data: {
        orderId: parsed.orderId,
        status: parsed.status,
        note: parsed.note || `Status updated from admin panel`,
        userId: session.sub,
      },
    });
  }

  if (parsed.status === "CANCELLED" && previous.status !== "CANCELLED") {
    await prisma.notification
      .create({ data: { type: "ORDER_CANCELLED", title: "Order cancelled", message: `Order ${previous.orderNumber} was cancelled.` } })
      .catch(() => undefined);
  }

  revalidatePath(`/admin/orders/${parsed.orderId}`);
  revalidatePath("/admin/orders");
}

export async function deleteOrder(id: string) {
  await requireAdminAction("orders", "delete");
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect("/admin/orders");
}
