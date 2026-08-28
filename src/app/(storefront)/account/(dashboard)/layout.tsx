import { requireCustomer } from "@/lib/auth/guards";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireCustomer();

  return (
    <div className="container-boutique grid grid-cols-1 gap-10 py-12 lg:grid-cols-[220px_1fr]">
      <aside className="border border-stone">
        <AccountNav />
      </aside>
      <div>{children}</div>
    </div>
  );
}
