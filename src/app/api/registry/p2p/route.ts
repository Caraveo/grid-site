import { NextResponse } from "next/server";
import {
  announceP2p,
  P2pError,
  resolveDial,
} from "@/lib/p2p-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/registry/p2p?realm=garage | ?gpId=…
 * Dial directory for mesh P2P (listen multiaddrs). Not for marketing pages.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const realm = url.searchParams.get("realm") ?? undefined;
  const gpId = url.searchParams.get("gpId") ?? undefined;
  if (!realm && !gpId) {
    return NextResponse.json(
      { ok: false, error: "realm or gpId required" },
      { status: 400 },
    );
  }
  const data = await resolveDial({ realm, gpId });
  return NextResponse.json(
    { ok: true, ...data },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

/**
 * POST /api/registry/p2p — announce listen for dial
 * Optional webhook secret when GRID_MESH_WEBHOOK_SECRET set.
 */
export async function POST(req: Request) {
  const secret = process.env.GRID_MESH_WEBHOOK_SECRET ?? "";
  if (secret.length >= 8) {
    const hdr = (req.headers.get("x-grid-webhook-secret") ?? "").trim();
    const bearer = (req.headers.get("authorization") ?? "")
      .replace(/^Bearer\s+/i, "")
      .trim();
    if (hdr !== secret && bearer !== secret) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  try {
    const row = await announceP2p({
      gpId: String(body.gpId ?? ""),
      realm: String(body.realm ?? ""),
      nodeId: String(body.nodeId ?? ""),
      label: body.label ? String(body.label) : undefined,
      listen: String(body.listen ?? ""),
      class: body.class ? String(body.class) : undefined,
    });
    return NextResponse.json(
      {
        ok: true,
        peer: {
          gpId: row.gpId,
          realm: row.realm,
          listen: row.listen,
          lastSeen: row.lastSeen,
          gridUrl: `grid://${row.realm}.grid`,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    if (e instanceof P2pError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[registry/p2p]", e);
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  }
}
