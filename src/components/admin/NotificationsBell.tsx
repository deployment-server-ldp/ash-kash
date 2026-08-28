"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Notification = { id: string; title: string; message: string; isRead: boolean; createdAt: string };

export function NotificationsBell({ unreadCount }: { unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [count, setCount] = useState(unreadCount);

  async function handleOpen() {
    setOpen((v) => !v);
    if (!notifications) {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    }
    if (count > 0) {
      await fetch("/api/admin/notifications", { method: "POST" });
      setCount(0);
    }
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 max-h-96 w-80 overflow-y-auto border border-stone bg-ivory shadow-lg">
          {!notifications || notifications.length === 0 ? (
            <p className="p-4 text-sm text-noir/50">No notifications.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="border-b border-stone px-4 py-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-noir/60">{n.message}</p>
                <p className="mt-1 text-[11px] text-noir/40">{formatDate(n.createdAt, { dateStyle: "short", timeStyle: "short" })}</p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
