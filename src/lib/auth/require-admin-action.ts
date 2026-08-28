import "server-only";
import { getSession, isAdminRole } from "./session";
import { can, type Action, type Resource } from "./rbac";
import type { UserRole } from "@prisma/client";

export class ForbiddenError extends Error {}

/** Use inside Server Actions (never trust page-level guards alone — actions are directly invokable). */
export async function requireAdminAction(resource: Resource, action: Action = "edit") {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    throw new ForbiddenError("You must be signed in as an admin to do this.");
  }
  if (!can(session.role as UserRole, resource, action)) {
    throw new ForbiddenError("You do not have permission to perform this action.");
  }
  return session;
}
