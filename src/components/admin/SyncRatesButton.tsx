"use client";

import { useState, useTransition } from "react";
import { syncCurrencyRatesNow } from "@/actions/admin/currencies";

export function SyncRatesButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mb-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setMessage(null);
            const result = await syncCurrencyRatesNow();
            if (result.error) {
              setMessage(result.error);
            } else if (result.updated.length === 0) {
              setMessage("No currencies needed updating.");
            } else {
              setMessage(`Updated: ${result.updated.join(", ")}${result.skipped.length ? ` · Skipped (pinned): ${result.skipped.join(", ")}` : ""}`);
            }
          })
        }
        className="btn-outline"
      >
        {isPending ? "Syncing…" : "Sync Live Rates Now"}
      </button>
      {message ? <p className="mt-1.5 text-xs text-noir/60">{message}</p> : null}
    </div>
  );
}
