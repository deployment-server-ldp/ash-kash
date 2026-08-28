import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function extensionFor(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return map[mimeType] ?? "bin";
}

/**
 * Saves an uploaded file and returns its public URL.
 * Storage backend is controlled by IMAGE_STORAGE ("local" | "s3"). Local storage writes
 * to /public/uploads and works out of the box on Hostinger. To use S3-compatible storage,
 * set IMAGE_STORAGE=s3 and the AWS_* variables, then install @aws-sdk/client-s3 and
 * implement uploadToS3() below — the rest of the app only depends on this function's
 * return value (a URL string), so no other code needs to change.
 */
export async function saveUploadedFile(file: File): Promise<string> {
  const backend = process.env.IMAGE_STORAGE ?? "local";

  if (backend === "s3") {
    throw new Error(
      "IMAGE_STORAGE=s3 is configured but the S3 upload backend is not implemented in this build. " +
        "Install @aws-sdk/client-s3 and implement uploadToS3() in src/lib/storage.ts, or set IMAGE_STORAGE=local."
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${extensionFor(file.type)}`;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}
