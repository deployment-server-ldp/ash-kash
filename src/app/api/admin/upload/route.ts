import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdminRole } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage";

// The "db" backend embeds the file directly in the database, so it stays capped small.
// Real object storage (cloudinary/s3) has nowhere near that constraint — Cloudinary's own
// free-tier limit is 10MB per image, so match that.
const MAX_SIZE = (process.env.IMAGE_STORAGE ?? "db") === "db" ? 2 * 1024 * 1024 : 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    const maxLabel = MAX_SIZE >= 10 * 1024 * 1024 ? "10MB" : "2MB";
    return NextResponse.json({ error: `File is too large (max ${maxLabel}). Please compress the image first.` }, { status: 400 });
  }

  try {
    const url = await saveUploadedFile(file);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
