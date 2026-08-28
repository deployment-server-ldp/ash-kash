import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export const metadata: Metadata = { title: "Add User" };

export default async function NewAdminUserPage() {
  await requireAdmin("users", "create");
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Add Admin User</h1>
      <AdminUserForm user={null} />
    </div>
  );
}
