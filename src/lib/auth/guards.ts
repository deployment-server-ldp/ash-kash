import "server-only";
import { redirect } from "next/navigation";
import { getSession, isAdminRole, type SessionPayload } from "./session";
import { can, type Action, type Resource } from "./rbac";
import type { UserRole } from "@prisma/client";

export async function getCurrentSession(): Promise<SessionPayload | null> {
  return getSession();
}

/** Use in admin server components/pages. Redirects to /admin/login if not authenticated or not an admin role. */
export async function requireAdmin(resource?: Resource, action: Action = "view") {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    redirect("/admin/login");
  }
  if (resource && !can(session.role as UserRole, resource, action)) {
    redirect("/admin?error=forbidden");
  }
  return session;
}

/** Use in customer account pages. Redirects to /account/login if not authenticated. */
export async function requireCustomer() {
  const session = await getSession();
  if (!session) {
    redirect("/account/login");
  }
  return session;
}
