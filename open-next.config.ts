import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Incremental cache can be added later with R2 (NEXT_INC_CACHE_R2_BUCKET).
// Mesh state lives in the MESH_KV binding — see src/lib/mesh-store.ts.
export default defineCloudflareConfig({});
