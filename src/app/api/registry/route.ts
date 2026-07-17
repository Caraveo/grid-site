import { NextResponse } from "next/server";
import { getPublicMesh } from "@/lib/mesh-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Canonical public mesh registry — https://grid-compute.com/api/registry */
const REGISTRY = "https://grid-compute.com";

/**
 * GET /api/registry
 *
 * Public peer registry for GRID CLI (`grid registry`) and external clients.
 * Location-only fields — never IPs, ports, hostnames, or wallets.
 */
export async function GET() {
  const mesh = await getPublicMesh();
  return NextResponse.json(
    {
      registry: REGISTRY,
      phase: mesh.phase,
      updatedAt: mesh.updatedAt,
      note: "Public mesh registry. Location-only. Never includes IPs or endpoints.",
      genesis: mesh.genesis,
      peers: mesh.peers,
      nodes: mesh.nodes,
      recentPings: mesh.recentPings,
      stats: mesh.stats,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
        "X-Grid-Registry": REGISTRY,
      },
    },
  );
}
