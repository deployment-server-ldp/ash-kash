"use client";

import { useEffect, useState } from "react";

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** A gently fluctuating "N people are looking at this" indicator — a common, deliberately
 * approximate social-proof nudge, not a real visitor count. */
export function LiveVisitorCounter() {
  const [count, setCount] = useState(() => randomBetween(25, 88));

  useEffect(() => {
    const interval = setInterval(() => setCount(randomBetween(25, 88)), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 border border-stone/60 bg-stone/20 px-4 py-2.5 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      <span>
        <strong>{count}</strong> people are looking at this!
      </span>
    </div>
  );
}
