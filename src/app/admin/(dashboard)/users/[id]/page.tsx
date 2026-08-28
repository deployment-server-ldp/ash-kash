import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export const metadata: Metadata = { title: "Edit User" };

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("users", "edit");
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Edit Admin User</h1>
      <AdminUserForm user={user} />
    </div>
  );
}
