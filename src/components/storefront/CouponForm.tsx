"use client";

import { useState, useTransition } from "react";
import { applyCoupon, removeCoupon } from "@/actions/cart";

export function CouponForm({ appliedCode, error }: { appliedCode: string | null; error: string | null }) {
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between border border-stone px-4 py-3 text-sm">
        <span>
          Coupon <strong>{appliedCode}</strong> applied
        </span>
        <button
          disabled={pending}
          onClick={() => startTransition(async () => { await removeCoupon(); })}
          className="text-noir/50 underline hover:text-noir"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          className="input flex-1 border-r-0"
        />
        <button
          disabled={pending || !code.trim()}
          onClick={() =>
            startTransition(async () => {
              setLocalError(null);
              const result = await applyCoupon(code);
              if (!result.success) setLocalError(result.error);
              else setCode("");
            })
          }
          className="btn-outline shrink-0"
        >
          Apply
        </button>
      </div>
      {(localError || error) ? <p className="mt-2 text-xs text-red-600">{localError ?? error}</p> : null}
    </div>
  );
}
