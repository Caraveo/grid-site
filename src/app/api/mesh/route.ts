import { NextResponse } from "next/server";
import { getPublicMesh } from "@/lib/mesh-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY = "https://grid-compute.com";
const GENESIS = process.env.GENESIS_API_URL || "https://genesis.grid-compute.com";
const ONLINE_MS = 60_000;

function genesisGeography() {
  const lat = Number(process.env.GENESIS_LAT);
  const lng = Number(process.env.GENESIS_LNG);
  return {
    label: process.env.GENESIS_LABEL || "GENESIS",
    region: process.env.GENESIS_REGION || "US-EAST-1",
    ...(Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : {}),
  };
}

async function genesisIsLive(): Promise<boolean> {
  try {
    const response = await fetch(`${GENESIS}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
      headers: { accept: "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** GET /api/mesh — public globe + peer list (alias of registry; no IPs). */
export async function GET() {
  const [mesh, genesisLive] = await Promise.all([
    getPublicMesh(),
    genesisIsLive(),
  ]);
  const now = Date.now();
  const peers = mesh.peers.map((node) => {
    const seen = node.lastSeen ? Date.parse(node.lastSeen) : 0;
    return {
      ...node,
      status:
        Number.isFinite(seen) && now - seen <= ONLINE_MS
          ? node.status
          : ("offline" as const),
    };
  });
  const genesis = {
    ...mesh.genesis,
    ...genesisGeography(),
    status: genesisLive ? ("online" as const) : ("offline" as const),
  };
  const nodes = [genesis, ...peers];
  return NextResponse.json(
    {
      registry: REGISTRY,
      ...mesh,
      genesis,
      nodes,
      peers,
      stats: {
        total: nodes.length,
        online: nodes.filter((node) => node.status === "online").length,
        peers: peers.length,
      },
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
