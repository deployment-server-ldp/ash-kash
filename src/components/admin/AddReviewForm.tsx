"use client";

import { useState } from "react";
import { createReview } from "@/actions/admin/reviews";

export function AddReviewForm({ products }: { products: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline mb-6">
        Add Review
      </button>
    );
  }

  return (
    <div className="mb-6 border border-stone bg-ivory p-5">
      <h2 className="mb-3 font-display text-lg">Add Review</h2>
      <form
        action={async (formData) => {
          await createReview(formData);
          setOpen(false);
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="label">Product</label>
          <select name="productId" required className="input">
            <option value="">— Select a product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Reviewer Name</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="label">Rating</label>
          <select name="rating" defaultValue="5" className="input">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Title (optional)</label>
          <input name="title" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Review Text</label>
          <textarea name="body" required rows={3} className="input" />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue="APPROVED" className="input">
            <option value="APPROVED">Approved (visible now)</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary">
            Save Review
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
