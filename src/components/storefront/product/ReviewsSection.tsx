"use client";

import { useActionState } from "react";
import { Star } from "lucide-react";
import type { ReviewVM } from "@/types/product";
import { submitReview, type ReviewFormState } from "@/actions/reviews";
import { formatDate } from "@/lib/utils";

const initialState: ReviewFormState = { success: false };

export function ReviewsSection({
  productId,
  reviews,
  ratingAvg,
  reviewsCount,
}: {
  productId: string;
  reviews: ReviewVM[];
  ratingAvg: number;
  reviewsCount: number;
}) {
  const [state, formAction, pending] = useActionState(submitReview, initialState);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(ratingAvg) ? "fill-clay-500 text-clay-500" : "text-stone"}`} />
            ))}
          </div>
          <span className="text-sm text-noir/60">
            {ratingAvg.toFixed(1)} ({reviewsCount} reviews)
          </span>
        </div>

        {reviews.length === 0 ? (
          <p className="text-noir/60">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          <ul className="space-y-6">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-stone pb-6">
                <div className="mb-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-clay-500 text-clay-500" : "text-stone"}`} />
                  ))}
                </div>
                {r.title ? <p className="font-medium">{r.title}</p> : null}
                <p className="mt-1 text-sm text-noir/70">{r.body}</p>
                <p className="mt-2 text-xs text-noir/40">
                  {r.name} — {formatDate(r.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-4 font-display text-xl">Write a Review</h3>
        {state.success ? (
          <p className="text-sm text-clay-600">Thank you! Your review has been submitted and is awaiting approval.</p>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="productId" value={productId} />
            <div>
              <label className="label">Rating</label>
              <select name="rating" defaultValue={5} className="input">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input name="name" required className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" name="email" required className="input" />
              </div>
            </div>
            <div>
              <label className="label">Review Title</label>
              <input name="title" className="input" />
            </div>
            <div>
              <label className="label">Review</label>
              <textarea name="body" required rows={4} className="input" />
            </div>
            {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
            <button type="submit" disabled={pending} className="btn-primary">
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
