"use client";

import { useState } from "react";
import type { Coupon, Category, Product } from "@prisma/client";
import { saveCoupon } from "@/actions/admin/coupons";

export function CouponForm({
  coupon,
  categories,
  products,
}: {
  coupon: Coupon | null;
  categories: Category[];
  products: Product[];
}) {
  const [type, setType] = useState(coupon?.type ?? "PERCENTAGE");
  const [appliesTo, setAppliesTo] = useState(coupon?.appliesTo ?? "ALL");
  const action = saveCoupon.bind(null, coupon?.id ?? null);

  function toInputDate(d: Date | null | undefined) {
    return d ? new Date(d).toISOString().slice(0, 16) : "";
  }

  return (
    <form action={action} className="max-w-xl space-y-4">
      <div>
        <label className="label">Coupon Code</label>
        <input name="code" defaultValue={coupon?.code} required className="input uppercase" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <select name="type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="input">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
          </select>
        </div>
        {type !== "FREE_SHIPPING" ? (
          <div>
            <label className="label">Amount {type === "PERCENTAGE" ? "(%)" : ""}</label>
            <input type="number" step="0.01" name="amount" defaultValue={coupon?.amount?.toString() ?? "0"} className="input" />
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Minimum Order Amount</label>
          <input type="number" step="0.01" name="minOrderAmount" defaultValue={coupon?.minOrderAmount?.toString() ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Max Discount Amount</label>
          <input type="number" step="0.01" name="maxDiscountAmount" defaultValue={coupon?.maxDiscountAmount?.toString() ?? ""} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Applies To</label>
        <select name="appliesTo" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as typeof appliesTo)} className="input">
          <option value="ALL">All Products</option>
          <option value="CATEGORY">Specific Category</option>
          <option value="PRODUCT">Specific Product</option>
        </select>
      </div>
      {appliesTo === "CATEGORY" ? (
        <div>
          <label className="label">Category</label>
          <select name="categoryId" defaultValue={coupon?.categoryId ?? ""} className="input">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {appliesTo === "PRODUCT" ? (
        <div>
          <label className="label">Product</label>
          <select name="productId" defaultValue={coupon?.productId ?? ""} className="input">
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date</label>
          <input type="datetime-local" name="startDate" defaultValue={toInputDate(coupon?.startDate)} className="input" />
        </div>
        <div>
          <label className="label">End Date</label>
          <input type="datetime-local" name="endDate" defaultValue={toInputDate(coupon?.endDate)} className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Usage Limit (total)</label>
          <input type="number" name="usageLimit" defaultValue={coupon?.usageLimit ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Usage Limit Per Customer</label>
          <input type="number" name="usageLimitPerCustomer" defaultValue={coupon?.usageLimitPerCustomer ?? ""} className="input" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="firstOrderOnly" value="true" defaultChecked={coupon?.firstOrderOnly} className="accent-clay-600" />
        First order only
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked={coupon?.isActive ?? true} className="accent-clay-600" />
        Active
      </label>
      <button type="submit" className="btn-primary">
        Save Coupon
      </button>
    </form>
  );
}
