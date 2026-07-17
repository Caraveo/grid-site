import { NextResponse } from "next/server";
import {
  COMPUTE_MAX_BODY_BYTES,
  ComputeError,
  filterComputeAnnounceBody,
  getPublicComputes,
  upsertComputes,
} from "@/lib/compute-store";
import { verifyWebhookSecret } from "@/lib/mesh-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY = "https://grid-compute.com";

/**
 * GET /api/registry/computes
 *
 * Public compute capacity registry — check which computes are available.
 * Query: ?available=1  ·  ?visibility=public|private|all
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const availableOnly =
    url.searchParams.get("available") === "1" ||
    url.searchParams.get("available") === "true";
  const visibilityRaw = (url.searchParams.get("visibility") ?? "all").toLowerCase();
  const visibility =
    visibilityRaw === "public" || visibilityRaw === "private"
      ? visibilityRaw
      : "all";

  const data = await getPublicComputes({ availableOnly, visibility });
  return NextResponse.json(
    {
      ...data,
      registry: REGISTRY,
      note: "Compute capacity registry. No IPs or endpoints. Heartbeat within availableMs = available.",
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

/**
 * POST /api/registry/computes
 *
 * Host announce / heartbeat (auth: GRID_WEBHOOK_SECRET in production).
 * Body: { nodeId, label?, computes: [{ name, image, visibility, freeSlots, … }] }
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

  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }
  if (rawText.length > COMPUTE_MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "payload too large" },
      { status: 413 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json(
      { ok: false, error: "body must be a JSON object" },
      { status: 400 },
    );
  }

  const body = filterComputeAnnounceBody(parsed as Record<string, unknown>);
  try {
    const rawComputes = Array.isArray(body.computes)
      ? (body.computes as Array<Record<string, unknown>>)
      : [];
    const computes = rawComputes.map((c) => ({
      name: String(c.name ?? ""),
      image: c.image != null ? String(c.image) : undefined,
      visibility: c.visibility != null ? String(c.visibility) : undefined,
      class: c.class != null ? String(c.class) : undefined,
      backend: c.backend != null ? String(c.backend) : undefined,
      replicas:
        typeof c.replicas === "number"
          ? c.replicas
          : c.replicas != null
            ? Number(c.replicas)
            : undefined,
      freeSlots:
        typeof c.freeSlots === "number"
          ? c.freeSlots
          : c.freeSlots != null
            ? Number(c.freeSlots)
            : undefined,
      status: c.status != null ? String(c.status) : undefined,
    }));
    const result = await upsertComputes({
      nodeId: String(body.nodeId ?? ""),
      label: body.label != null ? String(body.label) : undefined,
      computes,
    });
    return NextResponse.json(
      {
        ok: true,
        count: result.count,
        computes: result.computes,
        message: `Registered ${result.count} compute(s) on ${REGISTRY}`,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Grid-Registry": REGISTRY,
        },
      },
    );
  } catch (e) {
    if (e instanceof ComputeError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[registry/computes]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500 },
    );
  }
}
