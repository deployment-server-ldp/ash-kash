import type { Metadata } from "next";
import Image from "next/image";
import { LoginAdminForm } from "@/components/admin/LoginAdminForm";
import { getStoreSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Admin Sign In" };

export default async function AdminLoginPage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone">
      <div className="w-full max-w-sm bg-ivory p-8 shadow-sm">
        {settings.logoUrl ? (
          <Image src={settings.logoUrl} alt={settings.storeName} width={200} height={70} className="mx-auto mb-1 h-14 w-auto" />
        ) : (
          <h1 className="mb-1 text-center font-display text-2xl">{settings.storeName}</h1>
        )}
        <p className="mb-8 text-center text-sm text-noir/50">Admin Dashboard</p>
        <LoginAdminForm />
      </div>
    </div>
  );
}
