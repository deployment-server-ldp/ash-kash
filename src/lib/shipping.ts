import "server-only";
import { prisma } from "@/lib/prisma";

export async function resolveShippingMethodForCountry(countryCode: string | null | undefined) {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: { methods: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  const code = (countryCode ?? "").toUpperCase();
  const matched =
    zones.find((z) => Array.isArray(z.countries) && (z.countries as string[]).includes(code)) ??
    zones.find((z) => Array.isArray(z.countries) && (z.countries as string[]).includes("*"));

  const method = matched?.methods[0] ?? null;
  return { zone: matched ?? null, method };
}

export function calculateShippingCost(
  method: { price: unknown; freeShippingThreshold: unknown } | null,
  subtotalAfterDiscount: number
): number {
  if (!method) return 0;
  const threshold = method.freeShippingThreshold ? Number(method.freeShippingThreshold) : null;
  if (threshold !== null && subtotalAfterDiscount >= threshold) return 0;
  return Number(method.price);
}
