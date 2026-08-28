import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="container-boutique flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-display text-3xl">Create Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
