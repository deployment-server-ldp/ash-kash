"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, setSessionCookie } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type FormState = { success: boolean; error?: string; fieldErrors?: Record<string, string> };

const addressSchema = z.object({
  label: z.string().min(1).default("Home"),
  fullName: z.string().min(2),
  phone: z.string().min(6),
  countryCode: z.string().length(2),
  state: z.string().optional(),
  city: z.string().min(1),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  isDefault: z.coerce.boolean().optional(),
});

export async function addAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated." };

  const parsed = addressSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Please fill in all required fields." };

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.sub }, data: { isDefault: false } });
  }

  await prisma.address.create({
    data: {
      userId: session.sub,
      label: parsed.data.label,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      countryCode: parsed.data.countryCode.toUpperCase(),
      state: parsed.data.state || null,
      city: parsed.data.city,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 || null,
      postalCode: parsed.data.postalCode || null,
      isDefault: parsed.data.isDefault ?? false,
    },
  });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(addressId: string): Promise<FormState> {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated." };

  await prisma.address.deleteMany({ where: { id: addressId, userId: session.sub } });
  revalidatePath("/account/addresses");
  return { success: true };
}

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().optional(),
  currentPassword: z.string().optional(),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated." };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Please check the form." };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.sub } });

  const existing = await prisma.user.findFirst({
    where: { email: parsed.data.email.toLowerCase(), NOT: { id: session.sub } },
  });
  if (existing) return { success: false, error: "This email is already in use." };

  const data: { name: string; email: string; phone: string | null; password?: string } = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null,
  };

  if (parsed.data.password) {
    if (!parsed.data.currentPassword || !(await verifyPassword(parsed.data.currentPassword, user.password))) {
      return { success: false, error: "Current password is incorrect." };
    }
    data.password = await hashPassword(parsed.data.password);
  }

  const updated = await prisma.user.update({ where: { id: session.sub }, data });
  await setSessionCookie({ sub: updated.id, role: updated.userRole, name: updated.name, email: updated.email });

  revalidatePath("/account/profile");
  return { success: true };
}
