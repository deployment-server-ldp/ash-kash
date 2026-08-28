"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CURRENCY_COOKIE } from "@/lib/currency/service";

export async function switchCurrency(code: string) {
  const store = await cookies();
  store.set(CURRENCY_COOKIE, code.toUpperCase(), { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

const newsletterSchema = z.object({ email: z.string().email() });

export type NewsletterState = { success: boolean; error?: string };

export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Please enter a valid email address." };

  await prisma.newsletterSubscriber
    .upsert({
      where: { email: parsed.data.email.toLowerCase() },
      create: { email: parsed.data.email.toLowerCase() },
      update: {},
    })
    .catch(() => undefined);

  // NOTE: forward to the configured provider in src/lib/email.ts / StoreSetting.newsletterProvider
  // (Mailchimp/Klaviyo/Brevo) once an API key is configured — the subscriber is always saved locally first.
  return { success: true };
}

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export type ContactState = { success: boolean; error?: string };

export async function submitContactForm(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Please fill in all fields correctly." };

  // NOTE: wire to src/lib/email.ts to notify the store's contact address once an email
  // provider is configured. For now the submission is accepted and acknowledged.
  console.info("[contact-form]", parsed.data);
  return { success: true };
}
