import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: { images: post.featuredImage ? [post.featuredImage] : undefined },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
    include: { category: true, author: true },
  });
  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: { categoryId: post.categoryId, isPublished: true, id: { not: post.id } },
    take: 3,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.featuredImage ? [post.featuredImage] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
  };

  return (
    <article className="container-boutique max-w-3xl py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {post.category ? <p className="mb-2 text-xs uppercase tracking-wide text-clay-600">{post.category.name}</p> : null}
      <h1 className="font-display text-4xl">{post.title}</h1>
      {post.publishedAt ? <p className="mt-2 text-sm text-noir/50">{post.publishedAt.toLocaleDateString()}</p> : null}
      {post.featuredImage ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden">
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}
      <div className="prose prose-neutral mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

      {related.length > 0 ? (
        <div className="mt-16 border-t border-stone pt-8">
          <h2 className="mb-4 font-display text-xl">More Articles</h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/blog/${r.slug}`} className="underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
