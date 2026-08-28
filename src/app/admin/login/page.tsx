import type { Metadata } from "next";
import { LoginAdminForm } from "@/components/admin/LoginAdminForm";

export const metadata: Metadata = { title: "Admin Sign In" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone">
      <div className="w-full max-w-sm bg-ivory p-8 shadow-sm">
        <h1 className="mb-1 text-center font-display text-2xl">Ash &amp; Kash</h1>
        <p className="mb-8 text-center text-sm text-noir/50">Admin Dashboard</p>
        <LoginAdminForm />
      </div>
    </div>
  );
}
