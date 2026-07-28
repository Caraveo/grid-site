import { getPublicMesh } from "@/lib/mesh-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COORDINATOR = "https://coordinator.grid-compute.com";
const GENESIS = process.env.GENESIS_API_URL || "http://3.231.132.70:9100";

async function publicJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function GET() {
  const [mesh, coordinator, status, settlement, genesis, chain] =
    await Promise.all([
      getPublicMesh(),
      publicJson(`${COORDINATOR}/v1/stats`),
      publicJson(`${COORDINATOR}/v1/status`),
      publicJson(`${COORDINATOR}/v1/chain/status`),
      publicJson(`${GENESIS}/health`),
      publicJson(`${GENESIS}/v1/chain`),
    ]);

  return Response.json(
    {
      checkedAt: new Date().toISOString(),
      endpoints: {
        genesisP2p: "genesis.grid-compute.com:9900",
        genesisTruth: "genesis.grid-compute.com:9100",
        coordinator: "coordinator.grid-compute.com",
        mesh: "grid-compute.com/api/mesh",
      },
      health: {
        genesis: genesis != null,
        coordinator: coordinator != null && status != null,
        mesh: true,
      },
      genesis,
      chain,
      coordinator,
      status,
      settlement,
      mesh,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
