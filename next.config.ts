import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Uploaded images (product photos, slider images, logo/favicon, etc.) are embedded as
    // base64 data URLs (see src/lib/storage.ts) rather than written to disk, which inflates
    // their size by ~33% — and some forms (e.g. a homepage slide) submit two images at
    // once. The default 1mb Server Action body limit is far too tight for that.
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    // Hostinger's shared Node.js hosting doesn't reliably serve the /_next/image
    // optimizer route behind its reverse proxy, so images (including uploaded
    // logo/favicon files) fail to load through it. Serve images unoptimized
    // (as plain <img> requests) instead.
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
