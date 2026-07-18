import { NextResponse } from "next/server";
import { requireAdmin, timingSafeEqualString } from "@/lib/admin-auth";
import {
  createStepupToken,
  getStepupSecret,
  stepupCookieHeader,
  clearStepupCookieHeader,
} from "@/lib/admin-stepup";
import { appendAudit } from "@/lib/compliance-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/stepup
 * Body: { secret: string }  — GRID_ADMIN_STEPUP_SECRET or admin secret
 * Issues short-lived forensics cookie (15m).
 */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const stepSecret = getStepupSecret();
  if (!stepSecret) {
    return NextResponse.json(
      { ok: false, error: "step-up not configured" },
      { status: 503 },
    );
  }

  let body: { secret?: string };
  try {
    body = (await req.json()) as { secret?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const provided = String(body.secret ?? "").trim();
  if (!provided || !timingSafeEqualString(provided, stepSecret)) {
    return NextResponse.json(
      { ok: false, error: "invalid step-up secret" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const token = await createStepupToken(stepSecret);
  await appendAudit({
    action: "stepup_granted",
    actor: "admin",
    detail: "forensics 15m",
  });

  return NextResponse.json(
    { ok: true, ttlSec: 15 * 60 },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": stepupCookieHeader(token),
      },
    },
  );
}

/** DELETE — clear step-up */
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status },
    );
  }
  await appendAudit({ action: "stepup_cleared", actor: "admin" });
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": clearStepupCookieHeader(),
      },
    },
  );
}
