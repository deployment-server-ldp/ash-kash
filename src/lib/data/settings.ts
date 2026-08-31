import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getStoreSettings = cache(async () => {
  const settings = await prisma.storeSetting.findUnique({ where: { id: 1 } });
  return (
    settings ?? {
      id: 1,
      maintenanceMode: true,
      maintenanceMessage: null,
      storeName: "Ash & Kash",
      logoUrl: null,
      faviconUrl: null,
      brandColor: "#a97a3b",
      contactEmail: null,
      contactPhone: null,
      contactAddress: null,
      socialInstagram: null,
      socialFacebook: null,
      socialTiktok: null,
      socialPinterest: null,
      footerAbout: null,
      footerCopyright: null,
      codEnabled: true,
      freeShippingNote: null,
      baseCurrencyCode: "PKR",
      defaultCountryCode: "PK",
      taxEnabled: false,
      defaultTaxRate: 0,
      seoDefaultTitle: null,
      seoDefaultDescription: null,
      seoDefaultKeywords: null,
      seoDefaultOgImage: null,
      newsletterProvider: "none",
      newsletterApiKey: null,
      updatedAt: new Date(),
    }
  );
});
