import { NextResponse } from "next/server";
import {
  checkNameAvailable,
  confirmPayment,
  getRegistration,
  listPublicRegistrations,
  RegError,
  startRegistration,
} from "@/lib/registration-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/registry/register
 *  ?name=garage  → availability check
 *  ?id=reg_…     → registration status
 *  (none)        → public directory + fee info
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name");
  const id = url.searchParams.get("id");

  if (name) {
    const result = await checkNameAvailable(name);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
    });
  }

  if (id) {
    const reg = await getRegistration(id);
    if (!reg) {
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        ok: true,
        registration: {
          id: reg.id,
          name: reg.name,
          label: reg.label,
          class: reg.class,
          region: reg.region,
          status: reg.status,
          feeUsd: reg.feeUsd,
          paymentNote: reg.paymentNote,
          createdAt: reg.createdAt,
          updatedAt: reg.updatedAt,
        },
      },
      {
        headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
      },
    );
  }

  const dir = await listPublicRegistrations();
  return NextResponse.json(
    {
      ok: true,
      ...dir,
      payment: {
        method: "cash_app_only",
        cashtag: dir.cashtag,
        feeUsd: dir.feeUsd,
        note: "Cash App only. Send payment to the cashtag with the registration note.",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

/**
 * POST /api/registry/register
 *
 * Body actions:
 *  { action: "start", name, label?, class?, region?, nodeId? }
 *  { action: "confirm", id, cashConfirm? }
 */
export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json(
      { ok: false, error: "body must be object" },
      { status: 400 },
    );
  }

  const body = parsed as Record<string, unknown>;
  const action = String(body.action ?? "start").toLowerCase();

  try {
    if (action === "start") {
      const result = await startRegistration({
        name: String(body.name ?? ""),
        label: body.label != null ? String(body.label) : undefined,
        class: body.class != null ? String(body.class) : undefined,
        region: body.region != null ? String(body.region) : undefined,
        nodeId: body.nodeId != null ? String(body.nodeId) : undefined,
        kinds: body.kinds,
      });
      return NextResponse.json(
        {
          ok: true,
          step: "pay",
          ...result,
          payment: {
            method: "cash_app_only",
            cashtag: result.cashtag,
            feeUsd: result.feeUsd,
            note: result.registration.paymentNote,
            url: result.cashAppUrl,
          },
        },
        { status: 201 },
      );
    }

    if (action === "confirm") {
      const reg = await confirmPayment({
        id: String(body.id ?? ""),
        cashConfirm:
          body.cashConfirm != null ? String(body.cashConfirm) : undefined,
      });
      return NextResponse.json({
        ok: true,
        step: "review",
        registration: {
          id: reg.id,
          name: reg.name,
          label: reg.label,
          class: reg.class,
          region: reg.region,
          kinds: reg.kinds,
          status: reg.status,
          feeUsd: reg.feeUsd,
          paymentNote: reg.paymentNote,
          createdAt: reg.createdAt,
          updatedAt: reg.updatedAt,
        },
        message:
          "Payment claimed. Registration is pending review. You appear on registry.grid only after admin approve.",
      });
    }

    return NextResponse.json(
      { ok: false, error: "unknown action (start|confirm)" },
      { status: 400 },
    );
  } catch (e) {
    if (e instanceof RegError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[registry/register]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500 },
    );
  }
}
