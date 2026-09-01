import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
