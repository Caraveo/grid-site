import { NextResponse } from "next/server";
import {
  confirmEntityPayment,
  entityFees,
  EntityError,
  getActiveCertForRealm,
  getEntity,
  publicTierForRealm,
  startEntityApplication,
  type EntityApplication,
} from "@/lib/entity-store";
import { caConfigured, caPubkeyHex } from "@/lib/gp-ca";
import type { CertTier } from "@/lib/gp-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicApp(a: EntityApplication) {
  return {
    id: a.id,
    tier: a.tier,
    realm: a.realm,
    status: a.status,
    feeUsd: a.feeUsd,
    paymentNote: a.paymentNote,
    entityName: a.entityName,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    // gpId only returned to applicant by id lookup — not in public badge API
    hasCert: !!a.certJson && a.status === "active",
  };
}

/**
 * GET /api/registry/entity
 *  ?realm=garage       → public badges only (key/verified)
 *  ?realm=garage&cert=1 → badges + permanent cert JSON (for CLI verify)
 *  ?ca=1               → CA public key
 *  ?id=key_…           → application status
 *  (none)              → fee table
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const realm = url.searchParams.get("realm");
  const id = url.searchParams.get("id");
  const wantCa = url.searchParams.get("ca") === "1";
  const wantCert = url.searchParams.get("cert") === "1";

  if (wantCa && !realm && !id) {
    return NextResponse.json(
      {
        ok: true,
        caConfigured: caConfigured(),
        caPubkeyHex: caPubkeyHex(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  if (realm) {
    const badges = await publicTierForRealm(realm);
    const body: Record<string, unknown> = { ok: true, badges };
    if (wantCert) {
      const active = await getActiveCertForRealm(realm);
      body.cert = active?.cert ?? null;
      body.certActive = !!active;
    }
    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (id) {
    const app = await getEntity(id);
    if (!app) {
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 },
      );
    }
    let cert: unknown = null;
    if (app.status === "active" && app.certJson) {
      try {
        cert = JSON.parse(app.certJson);
      } catch {
        cert = null;
      }
    }
    return NextResponse.json(
      {
        ok: true,
        application: {
          ...publicApp(app),
          gpId: app.gpId,
        },
        cert,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const fees = entityFees();
  return NextResponse.json(
    {
      ok: true,
      fees,
      caConfigured: caConfigured(),
      payment: {
        method: "cash_app_only",
        cashtag: fees.cashtag,
        note: "Cash App only. Same flow as name registration.",
      },
      // Intentionally no protocol marketing copy
      products: [
        {
          tier: "key",
          feeUsd: fees.key,
          label: "Key",
          summary: "Security feature for your registered realm.",
        },
        {
          tier: "verified",
          feeUsd: fees.verified,
          label: "Verified Entity",
          summary: "Organization verification for your registered realm.",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

/**
 * POST /api/registry/entity
 * { action: "start", tier, realm, gpId, pubkeyHex, nodeId?, entityName? }
 * { action: "confirm", id, cashConfirm? }
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "").toLowerCase();

  try {
    if (action === "start") {
      const tier = String(body.tier ?? "").toLowerCase() as CertTier;
      const result = await startEntityApplication({
        tier,
        realm: String(body.realm ?? ""),
        gpId: String(body.gpId ?? ""),
        pubkeyHex: String(body.pubkeyHex ?? ""),
        nodeId: body.nodeId ? String(body.nodeId) : undefined,
        entityName: body.entityName ? String(body.entityName) : undefined,
      });
      return NextResponse.json(
        {
          ok: true,
          application: {
            ...publicApp(result.application),
            gpId: result.application.gpId,
          },
          cashAppUrl: result.cashAppUrl,
          cashtag: result.cashtag,
          feeUsd: result.feeUsd,
          instructions: result.instructions,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (action === "confirm") {
      const app = await confirmEntityPayment(
        String(body.id ?? ""),
        body.cashConfirm ? String(body.cashConfirm) : undefined,
      );
      return NextResponse.json(
        {
          ok: true,
          application: { ...publicApp(app), gpId: app.gpId },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: false, error: "unknown action (start|confirm)" },
      { status: 400 },
    );
  } catch (e) {
    if (e instanceof EntityError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[registry/entity]", e);
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  }
}
