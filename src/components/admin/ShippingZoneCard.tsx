"use client";

import { useState } from "react";
import type { ShippingZone, ShippingMethod } from "@prisma/client";
import { deleteMethod, deleteZone, saveMethod, saveZone } from "@/actions/admin/shipping";
import { DeleteButton } from "./DeleteButton";

export function ShippingZoneCard({ zone }: { zone: ShippingZone & { methods: ShippingMethod[] } }) {
  const [editingZone, setEditingZone] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);

  return (
    <div className="border border-stone bg-ivory p-6">
      {editingZone ? (
        <ZoneForm zone={zone} onDone={() => setEditingZone(false)} />
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg">{zone.name}</h2>
            <p className="text-xs text-noir/50">{(zone.countries as string[]).join(", ")}</p>
          </div>
          <div className="flex gap-3 text-xs uppercase tracking-wide">
            <span>{zone.isActive ? "Active" : "Inactive"}</span>
            <button onClick={() => setEditingZone(true)} className="underline">
              Edit
            </button>
            <DeleteButton action={deleteZone.bind(null, zone.id)} />
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone text-left text-xs uppercase text-noir/50">
            <th className="py-2">Method</th>
            <th className="py-2">Price</th>
            <th className="py-2">Free Over</th>
            <th className="py-2">ETA</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {zone.methods.map((m) =>
            editingMethodId === m.id ? (
              <tr key={m.id}>
                <td colSpan={5} className="py-3">
                  <MethodForm zoneId={zone.id} method={m} onDone={() => setEditingMethodId(null)} />
                </td>
              </tr>
            ) : (
              <tr key={m.id} className="border-b border-stone/50">
                <td className="py-2">{m.name}</td>
                <td className="py-2">{Number(m.price).toFixed(2)}</td>
                <td className="py-2">{m.freeShippingThreshold ? Number(m.freeShippingThreshold).toFixed(2) : "—"}</td>
                <td className="py-2">
                  {m.estimatedDaysMin}-{m.estimatedDaysMax} days
                </td>
                <td className="py-2">
                  <div className="flex justify-end gap-2 text-xs">
                    <button onClick={() => setEditingMethodId(m.id)} className="underline">
                      Edit
                    </button>
                    <DeleteButton action={deleteMethod.bind(null, m.id)} />
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {addingMethod ? (
        <div className="mt-3">
          <MethodForm zoneId={zone.id} onDone={() => setAddingMethod(false)} />
        </div>
      ) : (
        <button onClick={() => setAddingMethod(true)} className="btn-ghost mt-3">
          + Add Shipping Method
        </button>
      )}
    </div>
  );
}

function ZoneForm({ zone, onDone }: { zone?: ShippingZone; onDone: () => void }) {
  const action = saveZone.bind(null, zone?.id ?? null);
  return (
    <form
      action={async (fd) => {
        await action(fd);
        onDone();
      }}
      className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <input name="name" defaultValue={zone?.name} placeholder="Zone name" required className="input" />
      <input
        name="countries"
        defaultValue={zone ? (zone.countries as string[]).join(", ") : ""}
        placeholder="ISO2 codes, comma separated, or * for rest of world"
        required
        className="input sm:col-span-2"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={zone?.isActive ?? true} className="accent-clay-600" />
        Active
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn-primary">
          Save
        </button>
        <button type="button" onClick={onDone} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

function MethodForm({ zoneId, method, onDone }: { zoneId: string; method?: ShippingMethod; onDone: () => void }) {
  const action = saveMethod.bind(null, method?.id ?? null);
  return (
    <form
      action={async (fd) => {
        await action(fd);
        onDone();
      }}
      className="grid grid-cols-2 gap-3 border border-stone p-3 sm:grid-cols-5"
    >
      <input type="hidden" name="zoneId" value={zoneId} />
      <input name="name" defaultValue={method?.name} placeholder="Method name" required className="input" />
      <input type="number" step="0.01" name="price" defaultValue={method?.price?.toString() ?? "0"} placeholder="Price" className="input" />
      <input
        type="number"
        step="0.01"
        name="freeShippingThreshold"
        defaultValue={method?.freeShippingThreshold?.toString() ?? ""}
        placeholder="Free over"
        className="input"
      />
      <input type="number" name="estimatedDaysMin" defaultValue={method?.estimatedDaysMin ?? 2} placeholder="Min days" className="input" />
      <input type="number" name="estimatedDaysMax" defaultValue={method?.estimatedDaysMax ?? 5} placeholder="Max days" className="input" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={method?.isActive ?? true} className="accent-clay-600" />
        Active
      </label>
      <div className="col-span-full flex gap-2">
        <button type="submit" className="btn-primary">
          Save Method
        </button>
        <button type="button" onClick={onDone} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
