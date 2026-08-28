import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  PACKED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("px-2.5 py-1 text-xs uppercase tracking-wide", COLORS[status])}>
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
