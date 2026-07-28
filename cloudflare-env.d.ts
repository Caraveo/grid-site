/**
 * Cloudflare Worker bindings for grid-site.
 * Regenerate with: `npm run cf-typegen`
 * Keep MESH_KV + secrets aligned with wrangler.jsonc.
 */

interface CloudflareEnv {
  ASSETS?: Fetcher;
  WORKER_SELF_REFERENCE?: Service;
  /** Durable mesh store (location-only peer pings). */
  MESH_KV: KVNamespace;
  /** Webhook shared secret for POST /api/mesh/ping */
  GRID_WEBHOOK_SECRET?: string;
  /** Private coordinator-to-site mesh heartbeat secret. */
  MESH_SERVICE_SECRET?: string;
  GRID_PHASE?: string;
  GENESIS_LAT?: string;
  GENESIS_LNG?: string;
  GENESIS_LABEL?: string;
  GENESIS_REGION?: string;
  NEXTJS_ENV?: string;
}
