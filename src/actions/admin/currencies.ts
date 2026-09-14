"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

const currencySchema = z.object({
  name: z.string().min(1),
  code: z.string().length(3),
  symbol: z.string().min(1),
  exchangeRate: z.coerce.number().positive(),
  decimalPlaces: z.coerce.number().int().min(0).max(4),
  symbolPosition: z.enum(["BEFORE", "AFTER"]),
  isDefault: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  autoUpdate: z.coerce.boolean().optional(),
});

export async function saveCurrency(id: string | null, formData: FormData) {
  await requireAdminAction("currencies", id ? "edit" : "create");
  const parsed = currencySchema.parse(Object.fromEntries(formData.entries()));
  const isDefault = parsed.isDefault ?? false;
  const data = {
    ...parsed,
    code: parsed.code.toUpperCase(),
    isDefault,
    isActive: parsed.isActive ?? false,
    autoUpdate: parsed.autoUpdate ?? false,
    // The default/base currency is what product prices are entered in, so its own
    // conversion factor must always be 1 — everything else is priced relative to it.
    exchangeRate: isDefault ? 1 : parsed.exchangeRate,
  };

  if (isDefault) {
    await prisma.currency.updateMany({ data: { isDefault: false } });
    await prisma.storeSetting.upsert({
      where: { id: 1 },
      create: { id: 1, baseCurrencyCode: data.code },
      update: { baseCurrencyCode: data.code },
    });
  }

  let currencyId = id;
  if (id) {
    await prisma.currency.update({ where: { id }, data });
  } else {
    const created = await prisma.currency.create({ data });
    currencyId = created.id;
  }

  await prisma.exchangeRate.create({ data: { currencyId: currencyId!, rate: data.exchangeRate, source: "manual" } });

  revalidatePath("/admin/currencies");
  revalidatePath("/", "layout");
}

export async function syncCurrencyRatesNow() {
  await requireAdminAction("currencies", "edit");
  const { syncExchangeRates } = await import("@/lib/currency/sync");
  const result = await syncExchangeRates();
  revalidatePath("/admin/currencies");
  revalidatePath("/", "layout");
  return result;
}

export async function deleteCurrency(id: string) {
  await requireAdminAction("currencies", "delete");
  await prisma.currency.delete({ where: { id } });
  revalidatePath("/admin/currencies");
}

const countrySchema = z.object({
  name: z.string().min(1),
  iso2: z.string().length(2),
  phoneCode: z.string().optional(),
  currencyId: z.string(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveCountry(id: string | null, formData: FormData) {
  await requireAdminAction("currencies", id ? "edit" : "create");
  const parsed = countrySchema.parse(Object.fromEntries(formData.entries()));
  const data = { ...parsed, iso2: parsed.iso2.toUpperCase(), isActive: parsed.isActive ?? false };

  if (id) {
    await prisma.country.update({ where: { id }, data });
  } else {
    await prisma.country.create({ data });
  }
  revalidatePath("/admin/currencies");
  revalidatePath("/", "layout");
}

export async function deleteCountry(id: string) {
  await requireAdminAction("currencies", "delete");
  await prisma.country.delete({ where: { id } });
  revalidatePath("/admin/currencies");
}
