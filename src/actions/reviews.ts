"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const reviewSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(150).optional(),
  body: z.string().min(10, "Please write at least 10 characters."),
});

export type ReviewFormState = { success: boolean; error?: string };

// simple in-memory rate limiter (per-process; fine for a single Node instance on Hostinger)
const submissionLog = new Map<string, number[]>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function submitReview(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (submissionLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    return { success: false, error: "Too many reviews submitted. Please try again later." };
  }

  const duplicate = await prisma.review.findFirst({
    where: { productId: parsed.data.productId, email: parsed.data.email.toLowerCase() },
  });
  if (duplicate) {
    return { success: false, error: "You have already reviewed this product." };
  }

  const session = await getSession();

  await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      userId: session?.sub,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      status: "PENDING",
      ipAddress: ip,
    },
  });

  submissionLog.set(ip, [...recent, now]);

  await prisma.notification
    .create({ data: { type: "NEW_REVIEW", title: "New product review", message: `${parsed.data.name} left a review awaiting approval.` } })
    .catch(() => undefined);

  revalidatePath("/product", "page");
  return { success: true };
}
