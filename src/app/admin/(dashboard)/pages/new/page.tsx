import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { PageForm } from "@/components/admin/PageForm";

export const metadata: Metadata = { title: "Add Page" };

export default async function NewPagePage() {
  await requireAdmin("content", "create");
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Add Page</h1>
      <PageForm page={null} />
    </div>
  );
}
