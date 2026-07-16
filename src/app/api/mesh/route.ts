import { NextResponse } from "next/server";
import { getPublicMesh } from "@/lib/mesh-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/mesh — public globe + peer list (no IPs, no secrets). */
export async function GET() {
  const mesh = await getPublicMesh();
  return NextResponse.json(mesh, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
