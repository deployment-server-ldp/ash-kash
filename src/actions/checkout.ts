"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { getOrCreateCart } from "@/lib/cart";
import { getSession } from "@/lib/auth/session";
import { createOrderFromCart, CheckoutError } from "@/lib/checkout";

// Deliberately lenient: customers enter numbers and addresses in many formats, so only
// require that the essential fields aren't blank — never reject on format.
// Text columns are VARCHAR(191) in MySQL, so clip instead of failing the order.
const text = z.string().trim().transform((v) => v.slice(0, 191));
const required = (message: string) => z.string().trim().min(1, message).transform((v) => v.slice(0, 191));

const checkoutSchema = z.object({
  name: required("Please enter your full name."),
  email: text.optional(),
  phone: required("Please enter your phone number."),
  countryCode: z.string().length(2),
  state: text.optional(),
  city: required("City is required."),
  addressLine1: required("Address is required."),
  addressLine2: text.optional(),
  postalCode: text.optional(),
  notes: z.string().optional(),
});

export type CheckoutFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  orderNumber?: string;
  /** What the customer typed, so the form can be refilled after a failed attempt. */
  values?: Record<string, string>;
};

export async function placeOrder(_prev: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const raw = Object.fromEntries(formData.entries());
  const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { success: false, error: "Please check the highlighted fields.", fieldErrors, values };
  }

  try {
    const cart = await getOrCreateCart();
    const session = await getSession();
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const order = await createOrderFromCart({
      cartId: cart.id,
      userId: session?.sub ?? null,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone,
      countryCode: parsed.data.countryCode.toUpperCase(),
      state: parsed.data.state || null,
      city: parsed.data.city,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 || null,
      postalCode: parsed.data.postalCode || null,
      notes: parsed.data.notes || null,
      ipAddress,
    });

    return { success: true, orderNumber: order.orderNumber };
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { success: false, error: error.message, values };
    }
    return { success: false, error: "Something went wrong placing your order. Please try again.", values };
  }
}
