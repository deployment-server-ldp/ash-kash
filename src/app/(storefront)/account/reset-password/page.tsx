import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="container-boutique py-16 text-center">
        <p className="text-noir/60">This reset link is invalid.</p>
      </div>
    );
  }

  return (
    <div className="container-boutique flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-display text-3xl">Reset Password</h1>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
