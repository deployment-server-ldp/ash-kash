import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { CurrencyManager } from "@/components/admin/CurrencyManager";

export const metadata: Metadata = { title: "Currencies" };

export default async function AdminCurrenciesPage() {
  await requireAdmin("currencies");
  const [currencies, countries] = await Promise.all([
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.country.findMany({ include: { currency: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Currencies</h1>
      <CurrencyManager currencies={currencies} countries={countries} />
    </div>
  );
}
