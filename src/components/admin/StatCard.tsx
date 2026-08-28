import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  return (
    <div className="border border-stone bg-ivory p-5">
      <p className="text-xs uppercase tracking-wide text-noir/50">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-medium",
          tone === "warning" && "text-amber-600",
          tone === "danger" && "text-red-600",
          tone === "success" && "text-clay-600"
        )}
      >
        {value}
      </p>
    </div>
  );
}
