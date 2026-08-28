import type { UserRole } from "@prisma/client";

export type Resource =
  | "products"
  | "categories"
  | "collections"
  | "inventory"
  | "orders"
  | "customers"
  | "coupons"
  | "shipping"
  | "currencies"
  | "content"
  | "navigation"
  | "blog"
  | "seo"
  | "reviews"
  | "settings"
  | "users"
  | "analytics";

export type Action = "view" | "create" | "edit" | "delete" | "publish";

const FULL_ACCESS: Record<Resource, Action[]> = Object.fromEntries(
  ([
    "products",
    "categories",
    "collections",
    "inventory",
    "orders",
    "customers",
    "coupons",
    "shipping",
    "currencies",
    "content",
    "navigation",
    "blog",
    "seo",
    "reviews",
    "settings",
    "users",
    "analytics",
  ] as Resource[]).map((r) => [r, ["view", "create", "edit", "delete", "publish"]])
) as Record<Resource, Action[]>;

const ROLE_PERMISSIONS: Record<Exclude<UserRole, "CUSTOMER">, Partial<Record<Resource, Action[]>>> = {
  SUPER_ADMIN: FULL_ACCESS,
  MANAGER: FULL_ACCESS,
  PRODUCT_MANAGER: {
    products: ["view", "create", "edit", "delete", "publish"],
    categories: ["view", "create", "edit", "delete"],
    collections: ["view", "create", "edit", "delete"],
    inventory: ["view", "create", "edit"],
    reviews: ["view", "edit", "delete"],
    analytics: ["view"],
  },
  ORDER_MANAGER: {
    orders: ["view", "edit"],
    customers: ["view", "edit"],
    shipping: ["view"],
    coupons: ["view"],
    analytics: ["view"],
  },
  CONTENT_MANAGER: {
    content: ["view", "create", "edit", "delete", "publish"],
    navigation: ["view", "create", "edit", "delete"],
    blog: ["view", "create", "edit", "delete", "publish"],
    seo: ["view", "edit"],
  },
};

export function can(role: UserRole, resource: Resource, action: Action = "view"): boolean {
  if (role === "CUSTOMER") return false;
  const grants = ROLE_PERMISSIONS[role]?.[resource];
  return Boolean(grants?.includes(action));
}

export function canAccessAdmin(role: UserRole): boolean {
  return role !== "CUSTOMER";
}

export const ADMIN_ROLE_LABELS: Record<Exclude<UserRole, "CUSTOMER">, string> = {
  SUPER_ADMIN: "Super Admin",
  MANAGER: "Manager",
  PRODUCT_MANAGER: "Product Manager",
  ORDER_MANAGER: "Order Manager",
  CONTENT_MANAGER: "Content Manager",
};
