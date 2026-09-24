"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { can, type Resource } from "@/lib/auth/rbac";
import { cn } from "@/lib/utils";
import { logoutAdmin } from "@/actions/auth";

type NavItem = { href: string; label: string; resource?: Resource };
type NavGroup = { label?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  { items: [{ href: "/admin", label: "Dashboard" }] },
  { items: [{ href: "/admin/orders", label: "Orders", resource: "orders" }] },
  {
    label: "Products",
    items: [
      { href: "/admin/products", label: "All Products", resource: "products" },
      { href: "/admin/products/new", label: "Add Product", resource: "products" },
      { href: "/admin/products/attributes", label: "Sizes, Colors, Brands & Tags", resource: "products" },
      { href: "/admin/categories", label: "Categories", resource: "categories" },
      { href: "/admin/collections", label: "Collections", resource: "collections" },
      { href: "/admin/inventory", label: "Inventory", resource: "inventory" },
      { href: "/admin/reviews", label: "Reviews", resource: "reviews" },
    ],
  },
  { items: [{ href: "/admin/customers", label: "Customers", resource: "customers" }] },
  {
    label: "Marketing",
    items: [{ href: "/admin/coupons", label: "Coupons", resource: "coupons" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/content", label: "Homepage", resource: "content" },
      { href: "/admin/sliders", label: "Sliders", resource: "content" },
      { href: "/admin/pages", label: "Pages", resource: "content" },
      { href: "/admin/blog", label: "Blog", resource: "blog" },
    ],
  },
  {
    label: "Navigation",
    items: [{ href: "/admin/navigation", label: "Menus", resource: "navigation" }],
  },
  {
    items: [
      { href: "/admin/shipping", label: "Shipping", resource: "shipping" },
      { href: "/admin/currencies", label: "Currencies", resource: "currencies" },
      { href: "/admin/seo", label: "SEO", resource: "seo" },
      { href: "/admin/analytics", label: "Analytics", resource: "analytics" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/users", label: "Users & Roles", resource: "users" },
      { href: "/admin/settings", label: "Settings", resource: "settings" },
    ],
  },
];

export function AdminSidebar({ role, storeName, logoUrl }: { role: UserRole; storeName: string; logoUrl: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-stone bg-ivory">
      <div className="border-b border-stone px-6 py-5">
        {logoUrl ? (
          <Image src={logoUrl} alt={storeName} width={220} height={70} className="h-14 w-auto" />
        ) : (
          <p className="font-display text-lg">{storeName}</p>
        )}
        <p className="text-xs text-noir/50">Admin</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((group, gi) => {
          const items = group.items.filter((item) => !item.resource || can(role, item.resource));
          if (items.length === 0) return null;
          return (
            <div key={gi} className="mb-5">
              {group.label ? <p className="mb-1.5 px-3 text-[11px] uppercase tracking-wide text-noir/40">{group.label}</p> : null}
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded px-3 py-2 text-sm",
                    pathname === item.href ? "bg-noir text-ivory" : "text-noir/80 hover:bg-stone"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>
      <form action={logoutAdmin} className="border-t border-stone p-3">
        <button type="submit" className="w-full rounded px-3 py-2 text-left text-sm text-noir/70 hover:bg-stone">
          Sign Out
        </button>
      </form>
    </aside>
  );
}
