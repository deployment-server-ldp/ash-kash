import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  await requireAdmin("customers");

  const customers = await prisma.user.findMany({
    where: { userRole: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    customers.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone ?? "",
      orders: c._count.orders,
      joined: c.createdAt.toISOString().slice(0, 10),
    })),
    [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "orders", label: "Orders" },
      { key: "joined", label: "Joined" },
    ]
  );

  return csvResponse(csv, `customers-${new Date().toISOString().slice(0, 10)}.csv`);
}
