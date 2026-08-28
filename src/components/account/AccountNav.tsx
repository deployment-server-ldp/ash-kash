"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";

const links = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-4 py-2.5 text-sm",
            pathname === link.href ? "bg-noir text-ivory" : "text-noir/70 hover:bg-stone"
          )}
        >
          {link.label}
        </Link>
      ))}
      <form action={logout}>
        <button type="submit" className="w-full px-4 py-2.5 text-left text-sm text-noir/70 hover:bg-stone">
          Sign Out
        </button>
      </form>
    </nav>
  );
}
