"use client";

import type { User } from "@prisma/client";
import { saveAdminUser } from "@/actions/admin/users";
import { ADMIN_ROLE_LABELS } from "@/lib/auth/rbac";

export function AdminUserForm({ user }: { user: User | null }) {
  const action = saveAdminUser.bind(null, user?.id ?? null);
  return (
    <form action={action} className="max-w-md space-y-4">
      <div>
        <label className="label">Name</label>
        <input name="name" defaultValue={user?.name} required className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" name="email" defaultValue={user?.email} required className="input" />
      </div>
      <div>
        <label className="label">{user ? "New Password (leave blank to keep current)" : "Password"}</label>
        <input type="password" name="password" required={!user} className="input" />
      </div>
      <div>
        <label className="label">Role</label>
        <select name="userRole" defaultValue={user?.userRole ?? "PRODUCT_MANAGER"} className="input">
          {Object.entries(ADMIN_ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={user?.isActive ?? true} className="accent-clay-600" />
        Active
      </label>
      <button type="submit" className="btn-primary">
        Save User
      </button>
    </form>
  );
}
