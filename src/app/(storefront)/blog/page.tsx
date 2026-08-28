import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Journal" };

const PLACEHOLDER = "/images/placeholder-product.svg";
const PAGE_SIZE = 9;

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const now = new Date();
  const where = { isPublished: true, OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return (
    <div className="container-boutique py-12">
      <h1 className="mb-10 text-center font-display text-4xl">The Journal</h1>
      {posts.length === 0 ? (
        <p className="text-center text-noir/60">No articles published yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                <Image
                  src={post.featuredImage ?? PLACEHOLDER}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {post.category ? <p className="mt-4 text-xs uppercase tracking-wide text-clay-600">{post.category.name}</p> : null}
              <h2 className="mt-1 font-display text-xl group-hover:text-clay-600">{post.title}</h2>
              {post.excerpt ? <p className="mt-2 text-sm text-noir/60">{post.excerpt}</p> : null}
            </Link>
          ))}
        </div>
      )}
      {total > PAGE_SIZE ? (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(total / PAGE_SIZE) }).map((_, i) => (
            <Link
              key={i}
              href={`/blog?page=${i + 1}`}
              className={`flex h-9 w-9 items-center justify-center text-sm ${i + 1 === page ? "bg-noir text-ivory" : "hover:bg-stone"}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
