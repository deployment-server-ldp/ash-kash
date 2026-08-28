import { getHomepageSections, getActiveSlider, resolveFeaturedProducts, getFeaturedCategories, getShowcaseCollections, getActiveTestimonials } from "@/lib/data/homepage";
import { HeroSlider } from "@/components/storefront/sections/HeroSlider";
import { FeaturedCategories } from "@/components/storefront/sections/FeaturedCategories";
import { ProductGridSection } from "@/components/storefront/sections/ProductGridSection";
import { PromoBanner } from "@/components/storefront/sections/PromoBanner";
import { CollectionShowcase } from "@/components/storefront/sections/CollectionShowcase";
import { BrandStory } from "@/components/storefront/sections/BrandStory";
import { Testimonials } from "@/components/storefront/sections/Testimonials";
import { InstagramGallery } from "@/components/storefront/sections/InstagramGallery";
import { NewsletterSection } from "@/components/storefront/sections/NewsletterSection";
import { EmptyHomepageState } from "@/components/storefront/sections/EmptyHomepageState";
import type { HomepageSection } from "@prisma/client";

async function renderSection(section: HomepageSection) {
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

export default async function HomePage() {
  const sections = await getHomepageSections();

  if (sections.length === 0) {
    return <EmptyHomepageState />;
  }

  const rendered = await Promise.all(sections.map(renderSection));
  return <div>{rendered}</div>;
}
