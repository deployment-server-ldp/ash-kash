import { Check } from "lucide-react";

export function TrustBadgesList({ badges }: { badges: string | null }) {
  const lines = (badges ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <ul className="space-y-2 text-sm text-noir/70">
      {lines.map((line, i) => (
        <li key={i} className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-clay-600" />
          {line}
        </li>
      ))}
    </ul>
  );
}
