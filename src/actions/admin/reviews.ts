"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/auth/require-admin-action";

async function refreshProductRating(productId: string) {
  const agg = await prisma.review.aggregate({ where: { productId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
  await prisma.product.update({
    where: { id: productId },
    data: { ratingAvg: agg._avg.rating ?? 0, reviewsCount: agg._count },
  });
}

export async function setReviewStatus(reviewId: string, status: "APPROVED" | "REJECTED" | "PENDING") {
  await requireAdminAction("reviews", "edit");
  const review = await prisma.review.update({ where: { id: reviewId }, data: { status } });
  await refreshProductRating(review.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/product", "page");
}

export async function toggleFeaturedReview(reviewId: string, isFeatured: boolean) {
  await requireAdminAction("reviews", "edit");
  await prisma.review.update({ where: { id: reviewId }, data: { isFeatured } });
  revalidatePath("/admin/reviews");
}

export async function deleteReview(reviewId: string) {
  await requireAdminAction("reviews", "delete");
  const review = await prisma.review.delete({ where: { id: reviewId } });
  await refreshProductRating(review.productId);
  revalidatePath("/admin/reviews");
}

const createReviewSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

/** Lets an admin add a review manually (no customer account needed) — for seeding social
 * proof on a product, or recording a review that came in outside the site (e.g. WhatsApp). */
export async function createReview(formData: FormData) {
  await requireAdminAction("reviews", "create");
  const parsed = createReviewSchema.parse(Object.fromEntries(formData.entries()));
  await prisma.review.create({
    data: {
      productId: parsed.productId,
      name: parsed.name,
      email: "",
      rating: parsed.rating,
      title: parsed.title || null,
      body: parsed.body,
      status: parsed.status,
      isFeatured: false,
    },
  });
  if (parsed.status === "APPROVED") await refreshProductRating(parsed.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}
