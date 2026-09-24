import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPageSections } from "@/lib/data/homepage";
import { renderSection } from "@/components/storefront/sections/renderSection";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return {};
  return { title: page.seoTitle ?? page.title, description: page.seoDescription ?? undefined };
}

export default async function CmsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = await prisma.page.findFirst({ where: { slug, isPublished: true } });
  if (!page) notFound();

  const sections = await getPageSections(page.id);

  if (sections.length > 0) {
    const rendered = await Promise.all(sections.map(renderSection));
    return <div>{rendered}</div>;
  }

  return (
    <div className="container-boutique max-w-3xl py-16">
      <h1 className="mb-8 font-display text-4xl">{page.title}</h1>
      <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: page.content ?? "" }} />
    </div>
  );
}
