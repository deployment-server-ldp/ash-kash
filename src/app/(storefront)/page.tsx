import { getHomepageSections } from "@/lib/data/homepage";
import { renderSection } from "@/components/storefront/sections/renderSection";
import { EmptyHomepageState } from "@/components/storefront/sections/EmptyHomepageState";

export default async function HomePage() {
  const sections = await getHomepageSections();

  if (sections.length === 0) {
    return <EmptyHomepageState />;
  }

  const rendered = await Promise.all(sections.map(renderSection));
  return <div>{rendered}</div>;
}
