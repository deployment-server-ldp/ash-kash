import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const unreadCount = await prisma.notification.count({
    where: { OR: [{ userId: null }, { userId: session.sub }], isRead: false },
  });

  return (
    <AdminShell role={session.role} userName={session.name} unreadCount={unreadCount}>
      {children}
    </AdminShell>
  );
}
