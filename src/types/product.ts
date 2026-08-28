export type ProductImageVM = { id: string; url: string; altText: string | null; isPrimary: boolean };

export type ProductCardVM = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  isFeatured: boolean;
  isSale: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  badge: string | null;
  primaryImage: string | null;
  hoverImage: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  inStock: boolean;
};

export type ProductVariantVM = {
  id: string;
  sku: string;
  title: string | null;
  price: number | null;
  compareAtPrice: number | null;
  inventoryQuantity: number;
  imageUrl: string | null;
  sizeId: string | null;
  sizeName: string | null;
  colorId: string | null;
  colorName: string | null;
  colorHex: string | null;
  isActive: boolean;
};

export type ReviewVM = {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
};

export type ProductDetailVM = ProductCardVM & {
  sku: string;
  shortDescription: string | null;
  description: string | null;
  videoUrl: string | null;
  trackInventory: boolean;
  inventoryQuantity: number;
  weight: number | null;
  categoryId: string | null;
  brandName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ratingAvg: number;
  reviewsCount: number;
  images: ProductImageVM[];
  variants: ProductVariantVM[];
  tags: { id: string; name: string; slug: string }[];
  reviews: ReviewVM[];
  sizeGuide: {
    id: string;
    title: string;
    unit: string;
    instructions: string | null;
    rows: { id: string; sizeName: string; measurements: Record<string, string> }[];
  } | null;
};
