"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginCustomer, registerCustomer, requestPasswordReset, resetPassword, type FormState } from "@/actions/auth";

const initial: FormState = { success: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginCustomer, initial);
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
      <div className="flex justify-between text-sm">
        <Link href="/account/register" className="underline">
          Create an account
        </Link>
        <Link href="/account/forgot-password" className="underline">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerCustomer, initial);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Full Name</label>
        <input name="name" required className="input" />
        {state.fieldErrors?.name ? <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p> : null}
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" name="email" required className="input" />
        {state.fieldErrors?.email ? <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p> : null}
      </div>
      <div>
        <label className="label">Phone (optional)</label>
        <input name="phone" className="input" />
      </div>
      <div>
        <label className="label">Password</label>
        <input type="password" name="password" required className="input" />
        {state.fieldErrors?.password ? <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password}</p> : null}
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        Create Account
      </button>
      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/account/login" className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initial);
  if (state.success) {
    return <p className="text-sm text-clay-600">If an account exists for that email, a reset link has been sent.</p>;
  }
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input type="email" name="email" required className="input" />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        Send Reset Link
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, initial);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="label">New Password</label>
        <input type="password" name="password" required className="input" />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        Reset Password
      </button>
    </form>
  );
}
