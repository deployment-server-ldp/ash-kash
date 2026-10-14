"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Country } from "@prisma/client";
import { placeOrder, type CheckoutFormState } from "@/actions/checkout";

const initialState: CheckoutFormState = { success: false };

export function CheckoutForm({ countries, defaultCountry }: { countries: Country[]; defaultCountry: string }) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.orderNumber) {
      router.push(`/checkout/confirmation/${state.orderNumber}`);
    }
  }, [state, router]);

  const fieldError = (name: string) => state.fieldErrors?.[name];
  // React resets the form after each submit; defaultValue makes it reset to what was typed.
  const value = (name: string) => state.values?.[name] ?? "";

  return (
    <form action={formAction} className="space-y-8">
      <section>
        <h2 className="mb-4 font-display text-xl">Contact Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full Name</label>
            <input name="name" maxLength={191} defaultValue={value("name")} required className="input" />
            {fieldError("name") ? <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p> : null}
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" maxLength={191} defaultValue={value("phone")} required className="input" />
            {fieldError("phone") ? <p className="mt-1 text-xs text-red-600">{fieldError("phone")}</p> : null}
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Email (optional)</label>
          <input name="email" maxLength={191} defaultValue={value("email")} className="input" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl">Shipping Address</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Country</label>
            <select name="countryCode" defaultValue={value("countryCode") || defaultCountry} required className="input">
              {countries.map((c) => (
                <option key={c.iso2} value={c.iso2}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">State / Province</label>
            <input name="state" maxLength={191} defaultValue={value("state")} className="input" />
          </div>
          <div>
            <label className="label">City</label>
            <input name="city" maxLength={191} defaultValue={value("city")} required className="input" />
            {fieldError("city") ? <p className="mt-1 text-xs text-red-600">{fieldError("city")}</p> : null}
          </div>
          <div>
            <label className="label">Postal Code</label>
            <input name="postalCode" maxLength={191} defaultValue={value("postalCode")} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input name="addressLine1" maxLength={191} defaultValue={value("addressLine1")} required className="input" />
            {fieldError("addressLine1") ? <p className="mt-1 text-xs text-red-600">{fieldError("addressLine1")}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <label className="label">Apartment / Suite (optional)</label>
            <input name="addressLine2" maxLength={191} defaultValue={value("addressLine2")} className="input" />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Order Notes (optional)</label>
          <textarea name="notes" rows={3} defaultValue={value("notes")} className="input" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl">Payment</h2>
        <label className="flex items-center gap-3 border border-noir p-4">
          <input type="radio" checked readOnly className="accent-noir" />
          <span>Cash on Delivery</span>
        </label>
      </section>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Placing Order…" : "Place Order — Cash on Delivery"}
      </button>
    </form>
  );
}
