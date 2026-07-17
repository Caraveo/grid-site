import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API routes (mesh webhook) need a server runtime on Cloudflare Workers.
  // Pages stay mostly static; /api/* is dynamic.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

// Local `next dev` platform proxy — bindings (MESH_KV, secrets) available in server code.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
