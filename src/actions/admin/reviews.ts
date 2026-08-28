"use server";

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
