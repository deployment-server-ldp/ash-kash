"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/actions/misc";

const initialState: NewsletterState = { success: false };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  if (state.success) {
    return <p className="text-sm text-clay-600">Thank you for subscribing.</p>;
  }

  return (
    <form action={formAction}>
      <div className="flex">
        <input type="email" name="email" required placeholder="Email address" className="input flex-1 border-r-0" />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          Join
        </button>
      </div>
      {state.error ? <p className="mt-2 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
