/**
 * Cloudflare Worker bindings for grid-site.
 * Regenerate with: `npm run cf-typegen`
 * Keep MESH_KV + secrets aligned with wrangler.jsonc.
 */

interface CloudflareEnv {
  ASSETS?: Fetcher;
  WORKER_SELF_REFERENCE?: Service;
  /** Private service binding to Ed25519 heartbeat verification. */
  MESH_AUTH?: {
    fetch(input: Request): Promise<Response>;
  };
  /** Durable mesh store (location-only peer pings). */
  MESH_KV: KVNamespace;
  GRID_PHASE?: string;
  GENESIS_LAT?: string;
  GENESIS_LNG?: string;
  GENESIS_LABEL?: string;
  GENESIS_REGION?: string;
  NEXTJS_ENV?: string;
}
