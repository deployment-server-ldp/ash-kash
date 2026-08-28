"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { AdminSidebar } from "./AdminSidebar";
import { NotificationsBell } from "./NotificationsBell";

export function AdminShell({
  role,
  userName,
  unreadCount,
  children,
}: {
  role: UserRole;
  userName: string;
  unreadCount: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stone/40">
      <div className="hidden lg:block">
        <AdminSidebar role={role} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-noir/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">
            <AdminSidebar role={role} />
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-stone bg-ivory px-4 lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div />
          <div className="flex items-center gap-4">
            <NotificationsBell unreadCount={unreadCount} />
            <span className="text-sm text-noir/70">{userName}</span>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
