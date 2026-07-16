import { NextResponse } from "next/server";
import {
  MAX_BODY_BYTES,
  MeshError,
  upsertPing,
  verifyWebhookSecret,
} from "@/lib/mesh-store";
import { filterPingBody, sanitizeNodeId } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/mesh/ping
 *
 * Location-only node heartbeat for the public globe.
 * All string fields are allowlist-filtered (no HTML/script/IP injection).
 */
export async function POST(req: Request) {
  if (!verifyWebhookSecret(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { ok: false, error: "content-type must be application/json" },
      { status: 415 },
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "payload too large" },
      { status: 413 },
    );
  }

  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid body" },
      { status: 400 },
    );
  }

  if (rawText.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "payload too large" },
      { status: 413 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400 },
    );
  }

  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    return NextResponse.json(
      { ok: false, error: "body must be a JSON object" },
      { status: 400 },
    );
  }

  // Allowlist keys only; drop nested objects / banned keys
  const body = filterPingBody(parsed as Record<string, unknown>);

  const nodeIdRaw = body.nodeId ?? body.id;
  if (sanitizeNodeId(nodeIdRaw) == null) {
    return NextResponse.json(
      { ok: false, error: "invalid nodeId" },
      { status: 400 },
    );
  }

  // Accept lat/lng or latitude/longitude aliases
  const lat = body.lat ?? body.latitude;
  const lng = body.lng ?? body.longitude;

  // status alias: signal
  const status = body.status ?? body.signal;
  // label alias: name
  const label = body.label ?? body.name;

  try {
    const result = await upsertPing({
      nodeId: String(nodeIdRaw),
      label: label != null ? String(label) : undefined,
      class: body.class != null ? String(body.class) : undefined,
      region: body.region != null ? String(body.region) : undefined,
      status: status != null ? String(status) : undefined,
      lat: Number(lat),
      lng: Number(lng),
    });

    return NextResponse.json(
      {
        ok: true,
        isNew: result.isNew,
        message: result.message,
        node: {
          id: result.node.id,
          label: result.node.label,
          class: result.node.class,
          region: result.node.region,
          status: result.node.status,
          lat: result.node.lat,
          lng: result.node.lng,
          lastSeen: result.node.lastSeen,
          pingCount: result.node.pingCount,
        },
      },
      {
        status: result.isNew ? 201 : 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (e) {
    if (e instanceof MeshError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[mesh/ping]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "POST /api/mesh/ping",
    purpose: "Location-only node pings for the public GRID globe",
    accepts: ["nodeId", "lat", "lng", "label?", "class?", "region?", "status?"],
    filters: [
      "allowlist keys only",
      "label: alnum + limited punctuation, no HTML/script",
      "status/signal: online|syncing|idle|offline",
      "class: S|M|L",
      "region: A-Z0-9_- only",
      "nodeId: [a-zA-Z0-9_-]{2,64}",
      "no IPs, hostnames, nested objects",
      `max body ${MAX_BODY_BYTES} bytes`,
    ],
    auth: "Bearer GRID_WEBHOOK_SECRET or X-Grid-Secret",
  });
}
