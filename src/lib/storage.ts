import "server-only";

/**
 * Saves an uploaded file and returns its public URL.
 *
 * Storage backend is controlled by IMAGE_STORAGE ("db" | "s3"). "db" (the default) embeds
 * the file directly in the database as a base64 data URL — this is deliberate, not a
 * shortcut: on Hostinger's shared Node.js hosting, files written to /public/uploads do not
 * reliably survive a redeploy or an app restart, so anything saved to local disk silently
 * disappears later. Embedding in the database has no such dependency. The tradeoff is
 * database size, which is why the upload route caps file size — fine for a boutique
 * catalog, but if the image library grows very large, switch to proper object storage:
 * set IMAGE_STORAGE=s3 and the AWS_* variables, then install @aws-sdk/client-s3 and
 * implement uploadToS3() below — the rest of the app only depends on this function's
 * return value (a URL string), so no other code needs to change.
 */
export async function saveUploadedFile(file: File): Promise<string> {
  const backend = process.env.IMAGE_STORAGE ?? "db";

  if (backend === "s3") {
    throw new Error(
      "IMAGE_STORAGE=s3 is configured but the S3 upload backend is not implemented in this build. " +
        "Install @aws-sdk/client-s3 and implement uploadToS3() in src/lib/storage.ts, or unset IMAGE_STORAGE."
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}
