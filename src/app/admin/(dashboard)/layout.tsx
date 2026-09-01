import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/data/settings";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [unreadCount, settings] = await Promise.all([
    prisma.notification.count({ where: { OR: [{ userId: null }, { userId: session.sub }], isRead: false } }),
    getStoreSettings(),
  ]);

  return (
    <AdminShell role={session.role} userName={session.name} unreadCount={unreadCount} storeName={settings.storeName} logoUrl={settings.logoUrl}>
      {children}
    </AdminShell>
  );
}
