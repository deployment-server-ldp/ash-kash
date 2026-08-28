import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/data/products";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  const products = await getProductsByIds(ids.slice(0, 8));
  return NextResponse.json({ products });
}
