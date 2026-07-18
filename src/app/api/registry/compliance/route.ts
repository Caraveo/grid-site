import { NextResponse } from "next/server";
import {
  ComplianceError,
  upsertAttestation,
} from "@/lib/compliance-store";
import { isValidGpIdHex, normalizeRealm } from "@/lib/gp-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/registry/compliance
 *
 * Node posts consent-gated attestation. IP/MAC encrypted at rest.
 * Not listed on public registry pages. Requires webhook secret
 * (same as mesh announce) when GRID_MESH_WEBHOOK_SECRET is set.
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

  // Explicit consent flag from CLI
  if (body.consent !== true && body.consent !== "true") {
    return NextResponse.json(
      {
        ok: false,
        error: "consent required — run grid compliance enable first",
      },
      { status: 400 },
    );
  }

  const gpId = String(body.gpId ?? "");
  const realm = String(body.realm ?? "");
  if (!isValidGpIdHex(gpId) || !normalizeRealm(realm)) {
    return NextResponse.json(
      { ok: false, error: "gpId and realm required" },
      { status: 400 },
    );
  }

  try {
    const row = await upsertAttestation({
      gpId,
      realm,
      nodeId: String(body.nodeId ?? ""),
      machineRef: String(body.machineRef ?? body.machineId ?? ""),
      ip: String(body.ip ?? ""),
      mac: String(body.mac ?? ""),
      consentVersion: String(body.consentVersion ?? "2026-07-consent-v1"),
      collectedAt: body.collectedAt
        ? String(body.collectedAt)
        : undefined,
      bodyHash: body.bodyHash ? String(body.bodyHash) : undefined,
      signature: body.signature ? String(body.signature) : undefined,
    });
    // Never echo IP/MAC back
    return NextResponse.json(
      {
        ok: true,
        id: row.id,
        gpId: row.gpId,
        realm: row.realm,
        updatedAt: row.updatedAt,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    if (e instanceof ComplianceError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[registry/compliance]", e);
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  }
}
