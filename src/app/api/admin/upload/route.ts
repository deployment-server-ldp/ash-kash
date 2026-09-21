import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdminRole } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage";

// Images are embedded directly in the database (see src/lib/storage.ts) rather than
// written to disk, so this cap keeps individual rows/pages reasonably sized.
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
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
    return NextResponse.json({ error: "File is too large (max 2MB). Please compress the image first." }, { status: 400 });
  }

  try {
    const url = await saveUploadedFile(file);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
