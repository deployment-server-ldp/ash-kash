import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AddressList } from "@/components/account/AddressList";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AddressesPage() {
  const session = await getSession();
  const [addresses, countries] = await Promise.all([
    prisma.address.findMany({ where: { userId: session!.sub }, orderBy: { isDefault: "desc" } }),
    prisma.country.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">My Addresses</h1>
      <AddressList addresses={addresses} countries={countries} />
    </div>
  );
}
