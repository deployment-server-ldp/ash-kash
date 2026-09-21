import "server-only";
import { randomUUID } from "crypto";

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
 *
 * Storage backend is controlled by IMAGE_STORAGE ("db" | "cloudinary" | "s3"):
 *
 * - "db" (default): embeds the file directly in the database as a base64 data URL. Zero
 *   setup and survives any redeploy, but a data: URL can't be fetched by social-media
 *   crawlers, so images stored this way won't appear in WhatsApp/Facebook/etc. link
 *   previews (see the openGraph guards in the product/blog pages).
 * - "cloudinary" (recommended if social previews matter): uploads to Cloudinary's free
 *   tier and returns a real public URL. Simplest option needing real setup — just two
 *   values, no secret keys, no bucket to configure. See .env.example.
 * - "s3": uploads to S3-compatible object storage (e.g. Cloudflare R2) instead — more
 *   setup, useful if you outgrow Cloudinary's free tier. Requires AWS_ACCESS_KEY_ID,
 *   AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_ENDPOINT and IMAGE_PUBLIC_BASE_URL.
 */
export async function saveUploadedFile(file: File): Promise<string> {
  const backend = process.env.IMAGE_STORAGE ?? "db";

  if (backend === "cloudinary") {
    return uploadToCloudinary(file);
  }
  if (backend === "s3") {
    return uploadToS3(file);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const uploadPreset = requireEnv("CLOUDINARY_UPLOAD_PRESET");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Cloudinary upload failed.");
  }
  return data.secure_url as string;
}

async function uploadToS3(file: File): Promise<string> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  const endpoint = requireEnv("AWS_ENDPOINT");
  const bucket = requireEnv("AWS_BUCKET_NAME");
  const publicBaseUrl = requireEnv("IMAGE_PUBLIC_BASE_URL");

  const client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });

  const key = `${randomUUID()}.${extensionFor(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. See .env.example for setup steps.`);
  }
  return value;
}
