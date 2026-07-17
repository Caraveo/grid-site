import { NextResponse } from "next/server";
import { getPublicMesh } from "@/lib/mesh-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY = "https://grid-compute.com";

/** GET /api/mesh — public globe + peer list (alias of registry; no IPs). */
export async function GET() {
  const mesh = await getPublicMesh();
  return NextResponse.json(
    {
      registry: REGISTRY,
      ...mesh,
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
