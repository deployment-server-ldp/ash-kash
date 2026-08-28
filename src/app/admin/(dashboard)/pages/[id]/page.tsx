import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { PageForm } from "@/components/admin/PageForm";

export const metadata: Metadata = { title: "Edit Page" };

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content", "edit");
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Edit Page</h1>
      <PageForm page={page} />
    </div>
  );
}
