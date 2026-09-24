import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ReviewRowActions } from "@/components/admin/ReviewRowActions";
import { AddReviewForm } from "@/components/admin/AddReviewForm";

export const metadata: Metadata = { title: "Reviews" };

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin("reviews");
  const { status } = await searchParams;

  const [reviews, products] = await Promise.all([
    prisma.review.findMany({
      where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {},
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Reviews</h1>

      <AddReviewForm products={products} />

      <div className="mb-4 flex gap-2 text-sm">
        {["", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <a key={s} href={s ? `?status=${s}` : "?"} className={`px-3 py-1.5 border border-stone ${status === s || (!status && !s) ? "bg-noir text-ivory" : ""}`}>
            {s || "All"}
          </a>
        ))}
      </div>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border border-stone bg-ivory p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{r.product.name}</p>
                <p className="text-xs text-noir/50">
                  {r.name} — {r.rating}/5 — {r.createdAt.toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs uppercase ${STATUS_COLORS[r.status]}`}>{r.status}</span>
            </div>
            {r.title ? <p className="font-medium">{r.title}</p> : null}
            <p className="mt-1 text-sm text-noir/70">{r.body}</p>
            <div className="mt-3">
              <ReviewRowActions review={r} />
            </div>
          </div>
        ))}
        {reviews.length === 0 ? <p className="text-noir/50">No reviews found.</p> : null}
      </div>
    </div>
  );
}
