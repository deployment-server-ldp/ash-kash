"use client";

import { useTransition } from "react";
import type { Review } from "@prisma/client";
import { deleteReview, setReviewStatus, toggleFeaturedReview } from "@/actions/admin/reviews";
import { DeleteButton } from "./DeleteButton";

export function ReviewRowActions({ review }: { review: Review }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide">
      {review.status !== "APPROVED" ? (
        <button disabled={pending} onClick={() => startTransition(() => setReviewStatus(review.id, "APPROVED"))} className="text-clay-600 underline">
          Approve
        </button>
      ) : null}
      {review.status !== "REJECTED" ? (
        <button disabled={pending} onClick={() => startTransition(() => setReviewStatus(review.id, "REJECTED"))} className="text-red-600 underline">
          Reject
        </button>
      ) : null}
      <button disabled={pending} onClick={() => startTransition(() => toggleFeaturedReview(review.id, !review.isFeatured))} className="underline">
        {review.isFeatured ? "Unfeature" : "Feature"}
      </button>
      <DeleteButton action={deleteReview.bind(null, review.id)} />
    </div>
  );
}
