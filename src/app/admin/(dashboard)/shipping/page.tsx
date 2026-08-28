import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ShippingZoneCard } from "@/components/admin/ShippingZoneCard";
import { NewZoneButton } from "@/components/admin/NewZoneButton";

export const metadata: Metadata = { title: "Shipping" };

export default async function AdminShippingPage() {
  await requireAdmin("shipping");
  const zones = await prisma.shippingZone.findMany({
    orderBy: { sortOrder: "asc" },
    include: { methods: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Shipping Zones</h1>
        <NewZoneButton />
      </div>
      <div className="space-y-6">
        {zones.map((zone) => (
          <ShippingZoneCard key={zone.id} zone={zone} />
        ))}
        {zones.length === 0 ? <p className="text-noir/50">No shipping zones yet.</p> : null}
      </div>
    </div>
  );
}
