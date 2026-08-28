"use client";

import { useTransition } from "react";

export function DeleteButton({
  action,
  confirmText = "Are you sure you want to delete this? This cannot be undone.",
  label = "Delete",
}: {
  action: () => Promise<unknown>;
  confirmText?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) startTransition(() => action());
      }}
      className="text-xs uppercase tracking-wide text-red-600 hover:underline disabled:opacity-50"
    >
      {label}
    </button>
  );
}
