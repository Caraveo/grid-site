import { NextResponse } from "next/server";
import { buildRegistryDirectory } from "@/lib/registry-directory";
import { getPublicMesh } from "@/lib/mesh-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Canonical public registry — https://grid-compute.com/api/registry */
const REGISTRY = "https://grid-compute.com";

/**
 * GET /api/registry
 *
 * registry.grid source of truth:
 * only entities with active paid registration (node and/or compute).
 * Live mesh pings alone do NOT list you here.
 */
export async function GET() {
  const [dir, mesh] = await Promise.all([
    buildRegistryDirectory(),
    getPublicMesh(),
  ]);

  return NextResponse.json(
    {
      registry: REGISTRY,
      phase: mesh.phase,
      updatedAt: new Date().toISOString(),
      note: dir.rule,
      rule: dir.rule,
      /** Registered directory for registry.grid */
      entries: dir.entries,
      /** Active registrations that host nodes (filtered mesh peers) */
      peers: dir.nodes.filter((n) => n.role !== "genesis"),
      nodes: dir.nodes,
      genesis: mesh.genesis,
      recentPings:
        mesh.recentPings?.filter((p) => {
          const lab = String(p.label ?? "")
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");
          const id = String(p.id ?? "").toLowerCase();
          return dir.entries.some(
            (e) => e.name === lab || id.includes(e.name) || id === e.name,
          );
        }) ?? [],
      /** Live computes only if name is active registry compute */
      computes: dir.computes,
      computeStats: {
        total: dir.computes.length,
        available: dir.computes.filter((c) => c.status === "available").length,
        busy: dir.computes.filter((c) => c.status === "busy").length,
        offline: dir.computes.filter((c) => c.status === "offline").length,
        freeSlots: dir.computes
          .filter((c) => c.status === "available")
          .reduce((s, c) => s + (c.freeSlots ?? 0), 0),
      },
      stats: {
        ...mesh.stats,
        registered: dir.stats.registered,
        registeredNodes: dir.stats.nodes,
        registeredComputes: dir.stats.computes,
        onlineRegisteredNodes: dir.stats.onlineNodes,
        availableRegisteredComputes: dir.stats.availableComputes,
      },
      links: {
        register: `${REGISTRY}/registry`,
        computes: `${REGISTRY}/api/registry/computes`,
        available: `${REGISTRY}/api/registry/computes?available=1`,
        meshPing: `${REGISTRY}/api/mesh/ping`,
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
