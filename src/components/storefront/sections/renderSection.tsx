import { getActiveSlider, resolveFeaturedProducts, getFeaturedCategories, getShowcaseCollections, getActiveTestimonials } from "@/lib/data/homepage";
import { HeroSlider } from "./HeroSlider";
import { FeaturedCategories } from "./FeaturedCategories";
import { ProductGridSection } from "./ProductGridSection";
import { PromoBanner } from "./PromoBanner";
import { CollectionShowcase } from "./CollectionShowcase";
import { BrandStory } from "./BrandStory";
import { Testimonials } from "./Testimonials";
import { InstagramGallery } from "./InstagramGallery";
import { NewsletterSection } from "./NewsletterSection";
import type { HomepageSection } from "@prisma/client";

/** Renders one homepage/page-builder section — shared between the homepage and any custom
 * page that uses the same section builder. */
export async function renderSection(section: HomepageSection) {
  switch (section.type) {
    case "HERO_SLIDER": {
      const slides = await getActiveSlider();
      return <HeroSlider key={section.id} slides={slides} />;
    }
    case "FEATURED_CATEGORIES": {
      const categories = await getFeaturedCategories();
      return <FeaturedCategories key={section.id} section={section} categories={categories} />;
    }
    case "NEW_ARRIVALS":
    case "FEATURED_PRODUCTS":
    case "BEST_SELLERS": {
      const products = await resolveFeaturedProducts(section.settings);
      return <ProductGridSection key={section.id} section={section} products={products} />;
    }
    case "PROMO_BANNER":
      return <PromoBanner key={section.id} section={section} />;
    case "COLLECTION_SHOWCASE": {
      const collections = await getShowcaseCollections();
      return <CollectionShowcase key={section.id} section={section} collections={collections} />;
    }
    case "BRAND_STORY":
      return <BrandStory key={section.id} section={section} />;
    case "TESTIMONIALS": {
      const testimonials = await getActiveTestimonials();
      return <Testimonials key={section.id} section={section} testimonials={testimonials} />;
    }
    case "INSTAGRAM": {
      const products = await resolveFeaturedProducts({ source: "latest", limit: 6 });
      return <InstagramGallery key={section.id} section={section} products={products} />;
    }
    case "NEWSLETTER":
      return <NewsletterSection key={section.id} section={section} />;
    default:
      return null;
  }
}
