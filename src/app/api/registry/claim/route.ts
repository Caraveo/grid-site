import { NextResponse } from "next/server";
import {
  acceptRealmClaim,
  ClaimError,
  getRealmClaim,
  listRealmClaims,
} from "@/lib/claim-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cors = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

/**
 * GET /api/registry/claim?name=fire  — lookup claim
 * GET /api/registry/claim            — list public claim digests
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name");
  if (name) {
    const claim = await getRealmClaim(name);
    if (!claim) {
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404, headers: cors },
      );
    }
    return NextResponse.json(
      {
        ok: true,
        claim: publicClaim(claim),
      },
      { headers: cors },
    );
  }
  const list = await listRealmClaims();
  return NextResponse.json(
    {
      ok: true,
      count: list.length,
      claims: list.map(publicClaim),
    },
    { headers: cors },
  );
}

/**
 * POST /api/registry/claim
 *
 * Body: signed realm claim from `grid claim <name>`
 * Verifies Ed25519 operator signature over bodyHash.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400, headers: cors },
    );
  }

  try {
    const result = await acceptRealmClaim(body);
    return NextResponse.json(
      {
        ok: true,
        registered: true,
        claim: publicClaim(result),
        message: `Realm grid://${result.name}.grid claimed by operator`,
      },
      { status: 201, headers: cors },
    );
  } catch (e) {
    if (e instanceof ClaimError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status, headers: cors },
      );
    }
    console.error("[registry/claim]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500, headers: cors },
    );
  }
}

function publicClaim(c: {
  name: string;
  realm: string;
  operatorPubkey: string;
  nodeId: string;
  nodeLabel: string;
  machineId: string;
  class: string;
  region: string;
  computes: string[];
  claimedAt: string;
  bodyHash: string;
  signature: string;
  auth?: { mode?: string; passkey?: boolean };
}) {
  return {
    name: c.name,
    realm: c.realm,
    operatorPubkey: c.operatorPubkey,
    nodeId: c.nodeId,
    nodeLabel: c.nodeLabel,
    machineId: c.machineId,
    class: c.class,
    region: c.region,
    computes: c.computes,
    claimedAt: c.claimedAt,
    bodyHash: c.bodyHash,
    signature: c.signature.slice(0, 16) + "…",
    auth: c.auth ?? null,
  };
}
