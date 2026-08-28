"use client";

import { useState } from "react";
import type { Order } from "@prisma/client";
import { updateOrderStatus } from "@/actions/admin/orders";

const STATUSES: Order["status"][] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

export function OrderStatusForm({ order }: { order: Order }) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (formData) => {
        await updateOrderStatus(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      className="space-y-4"
    >
      <input type="hidden" name="orderId" value={order.id} />
      <div>
        <label className="label">Status</label>
        <select name="status" defaultValue={order.status} className="input">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Status Note (optional)</label>
        <input name="note" placeholder="e.g. Shipped via TCS" className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tracking Number</label>
          <input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Tracking URL</label>
          <input name="trackingUrl" defaultValue={order.trackingUrl ?? ""} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Internal Notes (staff only)</label>
        <textarea name="internalNotes" defaultValue={order.internalNotes ?? ""} rows={3} className="input" />
      </div>
      <button type="submit" className="btn-primary">
        Update Order
      </button>
      {saved ? <span className="ml-3 text-sm text-clay-600">Saved.</span> : null}
    </form>
  );
}
