import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [categories, collections, products, pages, posts] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.collection.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    prisma.page.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: `${baseUrl}/`, priority: 1.0 },
    { url: `${baseUrl}/shop`, priority: 0.9 },
    { url: `${baseUrl}/blog`, priority: 0.6 },
    { url: `${baseUrl}/about`, priority: 0.5 },
    { url: `${baseUrl}/contact`, priority: 0.5 },
    ...categories.map((c) => ({ url: `${baseUrl}/category/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 })),
    ...collections.map((c) => ({ url: `${baseUrl}/collection/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 })),
    ...products.map((p) => ({ url: `${baseUrl}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
    ...pages.map((p) => ({ url: `${baseUrl}/pages/${p.slug}`, lastModified: p.updatedAt, priority: 0.4 })),
    ...posts.map((p) => ({ url: `${baseUrl}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
  ];
}
