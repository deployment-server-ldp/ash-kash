import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { toCardVM } from "@/lib/data/products";
import { ProductCard } from "@/components/storefront/ProductCard";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await requireCustomer();

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.sub },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 2 },
              variants: { where: { isActive: true }, select: { inventoryQuantity: true } },
              category: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  const products = (wishlist?.items ?? []).map((item) => toCardVM(item.product));

  return (
    <div className="container-boutique py-12">
      <h1 className="mb-8 font-display text-3xl">Your Wishlist</h1>
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-noir/60">Your wishlist is empty.</p>
          <Link href="/shop" className="btn-primary">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={{ ...p }} />
          ))}
        </div>
      )}
    </div>
  );
}
