"use client";

import { useActionState } from "react";
import { loginAdmin, type FormState } from "@/actions/auth";

const initial: FormState = { success: false };

export function LoginAdminForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input type="email" name="email" required className="input" />
      </div>
      <div>
        <label className="label">Password</label>
        <input type="password" name="password" required className="input" />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        Sign In
      </button>
    </form>
  );
}
