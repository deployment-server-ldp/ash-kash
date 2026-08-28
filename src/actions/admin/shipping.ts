"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

const zoneSchema = z.object({
  name: z.string().min(1),
  countries: z.string(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveZone(id: string | null, formData: FormData) {
  await requireAdminAction("shipping", id ? "edit" : "create");
  const parsed = zoneSchema.parse(Object.fromEntries(formData.entries()));
  const countries = parsed.countries
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const data = { name: parsed.name, countries, isActive: parsed.isActive ?? false };

  if (id) {
    await prisma.shippingZone.update({ where: { id }, data });
  } else {
    const max = await prisma.shippingZone.aggregate({ _max: { sortOrder: true } });
    await prisma.shippingZone.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  revalidatePath("/admin/shipping");
}

export async function deleteZone(id: string) {
  await requireAdminAction("shipping", "delete");
  await prisma.shippingZone.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}

const methodSchema = z.object({
  zoneId: z.string(),
  name: z.string().min(1),
  price: z.coerce.number().default(0),
  freeShippingThreshold: z.string().optional(),
  estimatedDaysMin: z.coerce.number().default(2),
  estimatedDaysMax: z.coerce.number().default(5),
  isActive: z.coerce.boolean().optional(),
});

export async function saveMethod(id: string | null, formData: FormData) {
  await requireAdminAction("shipping", id ? "edit" : "create");
  const parsed = methodSchema.parse(Object.fromEntries(formData.entries()));
  const data = {
    zoneId: parsed.zoneId,
    name: parsed.name,
    price: parsed.price,
    freeShippingThreshold: parsed.freeShippingThreshold ? Number(parsed.freeShippingThreshold) : null,
    estimatedDaysMin: parsed.estimatedDaysMin,
    estimatedDaysMax: parsed.estimatedDaysMax,
    isActive: parsed.isActive ?? false,
  };
  if (id) {
    await prisma.shippingMethod.update({ where: { id }, data });
  } else {
    const max = await prisma.shippingMethod.aggregate({ where: { zoneId: parsed.zoneId }, _max: { sortOrder: true } });
    await prisma.shippingMethod.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  revalidatePath("/admin/shipping");
}

export async function deleteMethod(id: string) {
  await requireAdminAction("shipping", "delete");
  await prisma.shippingMethod.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}
