"use server";

import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie, getSession, isAdminRole } from "@/lib/auth/session";
import { mergeGuestCartIntoUser } from "@/lib/cart";

export type FormState = { success: boolean; error?: string; fieldErrors?: Record<string, string> };

const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function registerCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] = issue.message;
    return { success: false, fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      password: await hashPassword(parsed.data.password),
      userRole: "CUSTOMER",
    },
  });

  await prisma.notification.create({
    data: { type: "NEW_CUSTOMER", title: "New customer registered", message: `${user.name} (${user.email}) just signed up.` },
  }).catch(() => undefined);

  await setSessionCookie({ sub: user.id, role: user.userRole, name: user.name, email: user.email });
  await mergeGuestCartIntoUser(user.id);
  redirect("/account");
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

export async function loginCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Please enter a valid email and password." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.isActive || !(await verifyPassword(parsed.data.password, user.password))) {
    return { success: false, error: "Invalid email or password." };
  }

  await setSessionCookie({ sub: user.id, role: user.userRole, name: user.name, email: user.email });
  await mergeGuestCartIntoUser(user.id);
  redirect("/account");
}

export async function loginAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Please enter a valid email and password." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.isActive || !isAdminRole(user.userRole) || !(await verifyPassword(parsed.data.password, user.password))) {
    return { success: false, error: "Invalid email or password." };
  }

  await setSessionCookie({ sub: user.id, role: user.userRole, name: user.name, email: user.email });
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

export async function logoutAdmin() {
  await clearSessionCookie();
  redirect("/admin/login");
}

const forgotSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Please enter a valid email." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // Always report success to avoid leaking which emails are registered.
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    // NOTE: wire this up to the configured email provider (see src/lib/email.ts) to send the
    // reset link: `${APP_URL}/account/reset-password?token=${token}`. Logged for local/dev use.
    console.info(`[password-reset] token for ${user.email}: ${token}`);
  }
  return { success: true };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Invalid request." };

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: await hashPassword(parsed.data.password) },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  redirect("/account/login?reset=success");
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub } });
}
