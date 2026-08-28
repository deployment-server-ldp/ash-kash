import Image from "next/image";
import Link from "next/link";
import type { ProductCardVM } from "@/types/product";
import { Price } from "./Price";
import { WishlistButton } from "./WishlistButton";

const PLACEHOLDER = "/images/placeholder-product.svg";

export function ProductCard({ product }: { product: ProductCardVM }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const badges = [
    product.badge,
    !product.badge && product.isNewArrival ? "New" : null,
    !product.badge && discount ? `-${discount}%` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-stone">
          <Image
            src={product.primaryImage ?? PLACEHOLDER}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          {product.hoverImage ? (
            <Image
              src={product.hoverImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}
          {badges.length > 0 ? (
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {badges.map((b) => (
                <span key={b} className="bg-noir px-2.5 py-1 text-[10px] uppercase tracking-wide text-ivory">
                  {b}
                </span>
              ))}
            </div>
          ) : null}
          {!product.inStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ivory/70">
              <span className="border border-noir px-4 py-1.5 text-xs uppercase tracking-wide">Sold Out</span>
            </div>
          ) : null}
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <WishlistButton productId={product.id} />
      </div>
      <div className="mt-3 space-y-1 text-center">
        {product.categoryName ? <p className="text-[11px] uppercase tracking-wide text-noir/50">{product.categoryName}</p> : null}
        <Link href={`/product/${product.slug}`} className="block text-sm text-noir hover:text-clay-600">
          {product.name}
        </Link>
        <Price amount={product.price} compareAt={product.compareAtPrice} className="text-sm" />
      </div>
    </div>
  );
}
