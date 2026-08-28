import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.sub } });

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">My Profile</h1>
      <ProfileForm name={user.name} email={user.email} phone={user.phone} />
    </div>
  );
}
