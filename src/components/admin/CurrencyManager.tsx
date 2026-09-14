"use client";

import { useState } from "react";
import type { Currency, Country } from "@prisma/client";
import { deleteCountry, deleteCurrency, saveCountry, saveCurrency } from "@/actions/admin/currencies";
import { DeleteButton } from "./DeleteButton";
import { SyncRatesButton } from "./SyncRatesButton";

export function CurrencyManager({ currencies, countries }: { currencies: Currency[]; countries: (Country & { currency: Currency | null })[] }) {
  const base = currencies.find((c) => c.isDefault);
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-display text-xl">Currencies</h2>
        <p className="mb-4 max-w-2xl text-sm text-noir/60">
          Product prices are entered in the <strong>Default</strong> currency ({base ? base.code : "none set"}). Every other
          currency&apos;s rate converts 1 unit of {base ? base.code : "the base currency"} into that currency, and auto-updates
          from live market rates once a day (or on demand below) unless you turn off &ldquo;Auto&rdquo; for it.
        </p>
        <SyncRatesButton />
        <div className="overflow-x-auto border border-stone bg-ivory">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone bg-stone/40 text-left">
                <th className="p-3">Code</th>
                <th className="p-3">Symbol</th>
                <th className="p-3">Exchange Rate</th>
                <th className="p-3">Auto</th>
                <th className="p-3">Default</th>
                <th className="p-3">Active</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {currencies.map((c) => (
                <CurrencyRow key={c.id} currency={c} />
              ))}
            </tbody>
          </table>
        </div>
        <NewCurrencyForm />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl">Country → Currency Mapping</h2>
        <div className="overflow-x-auto border border-stone bg-ivory">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone bg-stone/40 text-left">
                <th className="p-3">Country</th>
                <th className="p-3">ISO2</th>
                <th className="p-3">Currency</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.id} className="border-b border-stone/60">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.iso2}</td>
                  <td className="p-3">{c.currency?.code ?? "—"}</td>
                  <td className="p-3">
                    <DeleteButton action={deleteCountry.bind(null, c.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <NewCountryForm currencies={currencies} />
      </section>
    </div>
  );
}

function CurrencyRow({ currency }: { currency: Currency }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <tr>
        <td colSpan={8} className="p-3">
          <CurrencyFormFields currency={currency} onDone={() => setEditing(false)} />
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-stone/60">
      <td className="p-3 font-medium">{currency.code}</td>
      <td className="p-3">{currency.symbol}</td>
      <td className="p-3">{currency.isDefault ? "1 (base)" : Number(currency.exchangeRate)}</td>
      <td className="p-3">{currency.isDefault ? "—" : currency.autoUpdate ? "Yes" : "Manual"}</td>
      <td className="p-3">{currency.isDefault ? "Yes" : ""}</td>
      <td className="p-3">{currency.isActive ? "Yes" : "No"}</td>
      <td className="p-3 text-xs text-noir/50">{new Date(currency.updatedAt).toLocaleString()}</td>
      <td className="p-3">
        <div className="flex justify-end gap-3 text-xs">
          <button onClick={() => setEditing(true)} className="underline">
            Edit
          </button>
          <DeleteButton action={deleteCurrency.bind(null, currency.id)} />
        </div>
      </td>
    </tr>
  );
}

function CurrencyFormFields({ currency, onDone }: { currency?: Currency; onDone: () => void }) {
  const action = saveCurrency.bind(null, currency?.id ?? null);
  return (
    <form
      action={async (fd) => {
        await action(fd);
        onDone();
      }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <input name="name" defaultValue={currency?.name} placeholder="Name" required className="input" />
      <input name="code" defaultValue={currency?.code} placeholder="Code (e.g. USD)" required maxLength={3} className="input uppercase" />
      <input name="symbol" defaultValue={currency?.symbol} placeholder="Symbol" required className="input" />
      <div>
        <input
          type="number"
          step="0.000001"
          name="exchangeRate"
          defaultValue={currency?.exchangeRate?.toString() ?? "1"}
          placeholder="Rate (1 base = ? this)"
          required
          className="input"
        />
        <p className="mt-1 text-[11px] text-noir/50">Ignored for the Default currency (always 1). Overwritten by auto-sync if enabled below.</p>
      </div>
      <input type="number" name="decimalPlaces" defaultValue={currency?.decimalPlaces ?? 2} className="input" />
      <select name="symbolPosition" defaultValue={currency?.symbolPosition ?? "BEFORE"} className="input">
        <option value="BEFORE">Symbol Before</option>
        <option value="AFTER">Symbol After</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" value="true" defaultChecked={currency?.isDefault} className="accent-clay-600" />
        Default (prices entered in this currency)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={currency?.isActive ?? true} className="accent-clay-600" />
        Active
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="autoUpdate" value="true" defaultChecked={currency?.autoUpdate ?? true} className="accent-clay-600" />
        Auto-update rate from live market rates
      </label>
      <div className="col-span-full flex gap-2">
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

function NewCurrencyForm() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline mt-3">
        Add Currency
      </button>
    );
  }
  return (
    <div className="mt-3 border border-stone p-4">
      <CurrencyFormFields onDone={() => setOpen(false)} />
    </div>
  );
}

function NewCountryForm({ currencies }: { currencies: Currency[] }) {
  const [open, setOpen] = useState(false);
  const action = saveCountry.bind(null, null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline mt-3">
        Add Country
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await action(fd);
        setOpen(false);
      }}
      className="mt-3 grid grid-cols-2 gap-3 border border-stone p-4 sm:grid-cols-4"
    >
      <input name="name" placeholder="Country name" required className="input" />
      <input name="iso2" placeholder="ISO2, e.g. PK" required maxLength={2} className="input uppercase" />
      <input name="phoneCode" placeholder="Phone code" className="input" />
      <select name="currencyId" required className="input">
        {currencies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code}
          </option>
        ))}
      </select>
      <input type="hidden" name="isActive" value="true" />
      <div className="col-span-full flex gap-2">
        <button type="submit" className="btn-primary">
          Save
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
