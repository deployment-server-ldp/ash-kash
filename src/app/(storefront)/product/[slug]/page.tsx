import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { formatMoney } from "@/lib/currency/format";
import { ImageGallery } from "@/components/storefront/product/ImageGallery";
import { AddToCartForm } from "@/components/storefront/product/AddToCartForm";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { ReviewsSection } from "@/components/storefront/product/ReviewsSection";
import { RecentlyViewed } from "@/components/storefront/product/RecentlyViewed";
import { ProductAccordion } from "@/components/storefront/product/ProductAccordion";
import { SizeGuideSection } from "@/components/storefront/product/SizeGuideSection";
import { LiveVisitorCounter } from "@/components/storefront/product/LiveVisitorCounter";
import { TrustBadgesList } from "@/components/storefront/product/TrustBadgesList";
import { ProductGridSection } from "@/components/storefront/sections/ProductGridSection";
import { getStoreSettings } from "@/lib/data/settings";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title: product.seoTitle ?? product.name,
      description: product.seoDescription ?? product.shortDescription ?? undefined,
      // og:image must be a real fetchable URL — social crawlers can't load data: URIs,
      // which is what an uploaded (as opposed to pasted-in) image now is (see
      // src/lib/storage.ts).
      images: product.primaryImage && !product.primaryImage.startsWith("data:") ? [product.primaryImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, currency, settings] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id),
    resolveCurrentCurrency(),
    getStoreSettings(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.shortDescription ?? undefined,
    sku: product.sku,
    brand: product.brandName ? { "@type": "Brand", name: product.brandName } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: currency.code,
      price: formatMoney(product.price, currency).replace(/[^0-9.]/g, ""),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/product/${product.slug}`,
    },
    aggregateRating:
      product.reviewsCount > 0
        ? { "@type": "AggregateRating", ratingValue: product.ratingAvg, reviewCount: product.reviewsCount }
        : undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: "/shop" },
      product.categoryName
        ? { "@type": "ListItem", position: 2, name: product.categoryName, item: `/category/${product.categorySlug}` }
        : null,
      { "@type": "ListItem", position: 3, name: product.name },
    ].filter(Boolean),
  };

  return (
    <div className="container-boutique py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-6 text-sm text-noir/50">
        <Link href="/shop">Shop</Link>
        {product.categoryName ? (
          <>
            {" / "}
            <Link href={`/category/${product.categorySlug}`}>{product.categoryName}</Link>
          </>
        ) : null}
        {" / "}
        <span className="text-noir">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} name={product.name} />

        <div>
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              {product.categoryName ? <p className="text-xs uppercase tracking-wide text-noir/50">{product.categoryName}</p> : null}
              <h1 className="mt-1 font-display text-3xl">{product.name}</h1>
            </div>
            <WishlistButton productId={product.id} size="lg" />
          </div>

          <AddToCartForm product={product} />

          <div className="mt-4">
            <LiveVisitorCounter />
          </div>

          <div className="mt-4">
            <TrustBadgesList badges={settings.productTrustBadges} />
          </div>

          <ProductAccordion
            items={[
              { title: "Description", content: product.description ?? product.shortDescription ?? "" },
              {
                title: "Shipping & Returns",
                content:
                  settings.freeShippingNote ??
                  "Cash on Delivery available. Standard delivery within 3-7 business days. See our return policy for details.",
              },
            ]}
          />
        </div>
      </div>

      {product.sizeGuide ? <SizeGuideSection sizeGuide={product.sizeGuide} /> : null}

      <div className="mt-20 border-t border-stone pt-12">
        <h2 className="mb-8 font-display text-2xl">Reviews</h2>
        <ReviewsSection productId={product.id} reviews={product.reviews} ratingAvg={product.ratingAvg} reviewsCount={product.reviewsCount} />
      </div>

      {related.length > 0 ? (
        <div className="mt-4">
          <ProductGridSection
            section={{
              id: "related",
              type: "FEATURED_PRODUCTS",
              title: "You May Also Like",
              subtitle: null,
              content: null,
              imageUrl: null,
              buttonText: null,
              buttonUrl: null,
              settings: null,
              sortOrder: 0,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }}
            products={related}
          />
        </div>
      ) : null}

      <RecentlyViewed currentProductId={product.id} />
    </div>
  );
}
