import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  adminStats,
  deleteRegistration,
  listAllRegistrations,
  RegError,
  setRegistrationStatus,
  type RegStatus,
} from "@/lib/registration-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deny(auth: { ok: false; status: number; error: string }) {
  return NextResponse.json(
    { ok: false, error: auth.error },
    { status: auth.status, headers: { "Cache-Control": "no-store" } },
  );
}

/** GET /api/admin/registrations — full list + stats (auth required) */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return deny(auth);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let registrations = await listAllRegistrations();
  if (status) {
    registrations = registrations.filter((r) => r.status === status);
  }
  const stats = await adminStats();

  return NextResponse.json(
    { ok: true, stats, registrations },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * POST /api/admin/registrations
 * { action: "set_status", id, status: active|rejected|pending_review|pending_payment }
 * { action: "delete", id }
 */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return deny(auth);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "").toLowerCase();
  const id = String(body.id ?? "");

  try {
    if (action === "set_status") {
      const status = String(body.status ?? "") as RegStatus;
      const reg = await setRegistrationStatus(id, status);
      return NextResponse.json(
        { ok: true, registration: reg },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (action === "delete") {
      await deleteRegistration(id);
      return NextResponse.json(
        { ok: true, deleted: id },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: false, error: "unknown action (set_status|delete)" },
      { status: 400 },
    );
  } catch (e) {
    if (e instanceof RegError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[admin/registrations]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500 },
    );
  }
}
