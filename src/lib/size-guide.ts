import type { ProductDetailVM } from "@/types/product";

/** True if at least one measurement cell across the guide's rows actually has a value. */
export function hasFilledMeasurements(sizeGuide: NonNullable<ProductDetailVM["sizeGuide"]>): boolean {
  return sizeGuide.rows.some((row) => Object.values(row.measurements).some((v) => v && v.trim().length > 0));
}
