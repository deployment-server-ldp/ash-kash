"use client";

import { useActionState, useEffect } from "react";
import type { Country } from "@prisma/client";
import { addAddress, type FormState } from "@/actions/account";

const initial: FormState = { success: false };

export function AddressForm({ countries, onDone }: { countries: Country[]; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState(addAddress, initial);

  useEffect(() => {
    if (state.success) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Label</label>
        <input name="label" defaultValue="Home" className="input" />
      </div>
      <div>
        <label className="label">Full Name</label>
        <input name="fullName" required className="input" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input name="phone" required className="input" />
      </div>
      <div>
        <label className="label">Country</label>
        <select name="countryCode" required className="input">
          {countries.map((c) => (
            <option key={c.iso2} value={c.iso2}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">State / Province</label>
        <input name="state" className="input" />
      </div>
      <div>
        <label className="label">City</label>
        <input name="city" required className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Address</label>
        <input name="addressLine1" required className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Apartment / Suite</label>
        <input name="addressLine2" className="input" />
      </div>
      <div>
        <label className="label">Postal Code</label>
        <input name="postalCode" className="input" />
      </div>
      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isDefault" value="true" className="accent-clay-600" />
          Set as default address
        </label>
      </div>
      {state.error ? <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary sm:col-span-2">
        Save Address
      </button>
    </form>
  );
}
