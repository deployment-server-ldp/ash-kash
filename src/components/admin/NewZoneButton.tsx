"use client";

import { useState } from "react";
import { saveZone } from "@/actions/admin/shipping";

export function NewZoneButton() {
  const [open, setOpen] = useState(false);
  const action = saveZone.bind(null, null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        Add Zone
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await action(fd);
        setOpen(false);
      }}
      className="flex gap-2"
    >
      <input name="name" placeholder="Zone name" required className="input" />
      <input name="countries" placeholder="ISO2 codes, e.g. PK, AE or *" required className="input" />
      <input type="hidden" name="isActive" value="true" />
      <button type="submit" className="btn-primary">
        Save
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
        Cancel
      </button>
    </form>
  );
}
