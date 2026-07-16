import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API routes (mesh webhook) need a Node/Vercel server — not static export.
  // Pages stay mostly static; /api/* is dynamic.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
