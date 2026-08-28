"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { getOrCreateCart } from "@/lib/cart";
import { getSession } from "@/lib/auth/session";
import { createOrderFromCart, CheckoutError } from "@/lib/checkout";

const checkoutSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(6, "Please enter a valid phone number."),
  countryCode: z.string().length(2),
  state: z.string().optional(),
  city: z.string().min(1, "City is required."),
  addressLine1: z.string().min(3, "Address is required."),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type CheckoutFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  orderNumber?: string;
};

export async function placeOrder(_prev: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { success: false, error: "Please check the highlighted fields.", fieldErrors };
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
      return { success: false, error: error.message };
    }
    return { success: false, error: "Something went wrong placing your order. Please try again." };
  }
}
