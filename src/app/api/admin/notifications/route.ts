import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { OR: [{ userId: null }, { userId: session.sub }] },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return NextResponse.json({ notifications });
}

export async function POST() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { OR: [{ userId: null }, { userId: session.sub }], isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
