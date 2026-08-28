"use client";

import { useState, useTransition } from "react";
import type { Address, Country } from "@prisma/client";
import { deleteAddress } from "@/actions/account";
import { AddressForm } from "./AddressForm";

export function AddressList({ addresses, countries }: { addresses: Address[]; countries: Country[] }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="border border-stone p-4 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium">{addr.label}</p>
              {addr.isDefault ? <span className="text-xs uppercase text-clay-600">Default</span> : null}
            </div>
            <p>{addr.fullName}</p>
            <p>{addr.addressLine1}</p>
            {addr.addressLine2 ? <p>{addr.addressLine2}</p> : null}
            <p>
              {addr.city}
              {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
            </p>
            <p>{addr.countryCode}</p>
            <p>{addr.phone}</p>
            <button
              disabled={pending}
              onClick={() => startTransition(async () => { await deleteAddress(addr.id); })}
              className="mt-3 text-xs uppercase tracking-wide text-red-600 underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="mt-6 border-t border-stone pt-6">
          <AddressForm countries={countries} onDone={() => setShowForm(false)} />
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-outline mt-6">
          Add New Address
        </button>
      )}
    </div>
  );
}
