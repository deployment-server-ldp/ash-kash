"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/actions/account";

const initial: FormState = { success: false };

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string | null }) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="label">Full Name</label>
        <input name="name" defaultValue={name} required className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" name="email" defaultValue={email} required className="input" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input name="phone" defaultValue={phone ?? ""} className="input" />
      </div>
      <div className="border-t border-stone pt-4">
        <p className="mb-3 text-sm text-noir/60">Leave password fields blank to keep your current password.</p>
        <div>
          <label className="label">Current Password</label>
          <input type="password" name="currentPassword" className="input" />
        </div>
        <div className="mt-4">
          <label className="label">New Password</label>
          <input type="password" name="password" className="input" />
        </div>
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-clay-600">Profile updated.</p> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        Save Changes
      </button>
    </form>
  );
}
