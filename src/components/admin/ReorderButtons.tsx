"use client";

import { useTransition } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export function ReorderButtons({
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
}: {
  onMoveUp: () => Promise<unknown>;
  onMoveDown: () => Promise<unknown>;
  disableUp?: boolean;
  disableDown?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      <button
        disabled={pending || disableUp}
        onClick={() => startTransition(async () => { await onMoveUp(); })}
        aria-label="Move up"
        className="rounded p-1 hover:bg-stone disabled:opacity-30"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        disabled={pending || disableDown}
        onClick={() => startTransition(async () => { await onMoveDown(); })}
        aria-label="Move down"
        className="rounded p-1 hover:bg-stone disabled:opacity-30"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}
