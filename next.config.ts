import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Logo/favicon are embedded as base64 data URLs (see ImageUploadField storeInline),
    // which inflates their size by ~33% — the default 1mb Server Action body limit is too
    // tight once both fields plus the rest of the settings form are submitted together.
    serverActions: { bodySizeLimit: "4mb" },
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
