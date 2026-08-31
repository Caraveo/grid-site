import { NextResponse } from "next/server";
import { getPublicMesh } from "@/lib/mesh-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY = "https://grid-compute.com";
const GENESIS = process.env.GENESIS_API_URL || "https://genesis.grid-compute.com";
// Nodes publish their privacy-preserving globe heartbeat every five minutes.
// Keep a generous delivery margin so a node does not disappear between pulses.
const ONLINE_MS = 15 * 60_000;

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
    // A valid, recent signed heartbeat is the liveness signal.  Do not let a
    // stale advisory status field override that proof: an old client can carry
    // `offline` while it is actively posting heartbeats.
    const isLive = Number.isFinite(seen) && now - seen <= ONLINE_MS;
    return {
      ...node,
      status: isLive
        ? node.status === "offline"
          ? ("online" as const)
          : node.status
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
