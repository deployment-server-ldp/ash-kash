import type { Metadata } from "next";
import { LoginForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="container-boutique flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-display text-3xl">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}
