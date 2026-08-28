import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ name: { contains: query } }, { sku: { contains: query } }, { description: { contains: query } }],
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 6,
  });

  return NextResponse.json({
    results: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      image: p.images[0]?.url ?? null,
    })),
  });
}
