"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

async function ensureSettingsRow() {
  return prisma.storeSetting.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
}

const generalSchema = z.object({
  storeName: z.string().min(1),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  brandColor: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialTiktok: z.string().optional(),
  socialPinterest: z.string().optional(),
  footerAbout: z.string().optional(),
  footerCopyright: z.string().optional(),
});

export async function updateGeneralSettings(formData: FormData) {
  await requireAdminAction("settings", "edit");
  await ensureSettingsRow();
  const parsed = generalSchema.parse(Object.fromEntries(formData.entries()));
  await prisma.storeSetting.update({
    where: { id: 1 },
    data: {
      storeName: parsed.storeName,
      logoUrl: parsed.logoUrl || null,
      faviconUrl: parsed.faviconUrl || null,
      brandColor: parsed.brandColor || "#a97a3b",
      contactEmail: parsed.contactEmail || null,
      contactPhone: parsed.contactPhone || null,
      contactAddress: parsed.contactAddress || null,
      socialInstagram: parsed.socialInstagram || null,
      socialFacebook: parsed.socialFacebook || null,
      socialTiktok: parsed.socialTiktok || null,
      socialPinterest: parsed.socialPinterest || null,
      footerAbout: parsed.footerAbout || null,
      footerCopyright: parsed.footerCopyright || null,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

const checkoutSchema = z.object({
  codEnabled: z.coerce.boolean().optional(),
  freeShippingNote: z.string().optional(),
  baseCurrencyCode: z.string().length(3),
  defaultCountryCode: z.string().length(2),
  taxEnabled: z.coerce.boolean().optional(),
  defaultTaxRate: z.coerce.number().default(0),
});

export async function updateCheckoutSettings(formData: FormData) {
  await requireAdminAction("settings", "edit");
  await ensureSettingsRow();
  const parsed = checkoutSchema.parse(Object.fromEntries(formData.entries()));
  await prisma.storeSetting.update({
    where: { id: 1 },
    data: {
      codEnabled: parsed.codEnabled ?? false,
      freeShippingNote: parsed.freeShippingNote || null,
      baseCurrencyCode: parsed.baseCurrencyCode.toUpperCase(),
      defaultCountryCode: parsed.defaultCountryCode.toUpperCase(),
      taxEnabled: parsed.taxEnabled ?? false,
      defaultTaxRate: parsed.defaultTaxRate,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

const newsletterSchema = z.object({
  newsletterProvider: z.enum(["none", "mailchimp", "klaviyo", "brevo"]),
  newsletterApiKey: z.string().optional(),
});

export async function updateNewsletterSettings(formData: FormData) {
  await requireAdminAction("settings", "edit");
  await ensureSettingsRow();
  const parsed = newsletterSchema.parse(Object.fromEntries(formData.entries()));
  await prisma.storeSetting.update({
    where: { id: 1 },
    data: { newsletterProvider: parsed.newsletterProvider, newsletterApiKey: parsed.newsletterApiKey || null },
  });
  revalidatePath("/admin/settings");
}

const seoSchema = z.object({
  seoDefaultTitle: z.string().optional(),
  seoDefaultDescription: z.string().optional(),
  seoDefaultKeywords: z.string().optional(),
  seoDefaultOgImage: z.string().optional(),
});

export async function updateSeoDefaults(formData: FormData) {
  await requireAdminAction("seo", "edit");
  await ensureSettingsRow();
  const parsed = seoSchema.parse(Object.fromEntries(formData.entries()));
  await prisma.storeSetting.update({
    where: { id: 1 },
    data: {
      seoDefaultTitle: parsed.seoDefaultTitle || null,
      seoDefaultDescription: parsed.seoDefaultDescription || null,
      seoDefaultKeywords: parsed.seoDefaultKeywords || null,
      seoDefaultOgImage: parsed.seoDefaultOgImage || null,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
}
