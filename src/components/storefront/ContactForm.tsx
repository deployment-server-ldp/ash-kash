"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactState } from "@/actions/misc";

const initial: ContactState = { success: false };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initial);

  if (state.success) {
    return <p className="text-clay-600">Thank you for reaching out — we&apos;ll get back to you shortly.</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" required className="input" />
        </div>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea name="message" rows={5} required className="input" />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        Send Message
      </button>
    </form>
  );
}
