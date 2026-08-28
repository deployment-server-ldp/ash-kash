import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteAdminUser } from "@/actions/admin/users";
import { ADMIN_ROLE_LABELS } from "@/lib/auth/rbac";

export const metadata: Metadata = { title: "Users & Roles" };

export default async function AdminUsersPage() {
  const session = await requireAdmin("users");
  const users = await prisma.user.findMany({ where: { userRole: { not: "CUSTOMER" } }, orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Admin Users</h1>
        <Link href="/admin/users/new" className="btn-primary">
          Add User
        </Link>
      </div>
      <div className="overflow-x-auto border border-stone bg-ivory">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone bg-stone/40 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-stone/60">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{ADMIN_ROLE_LABELS[u.userRole as keyof typeof ADMIN_ROLE_LABELS]}</td>
                <td className="p-3">{u.isActive ? "Active" : "Disabled"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/users/${u.id}`} className="text-xs uppercase tracking-wide underline">
                      Edit
                    </Link>
                    {u.id !== session.sub ? <DeleteButton action={deleteAdminUser.bind(null, u.id)} /> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
