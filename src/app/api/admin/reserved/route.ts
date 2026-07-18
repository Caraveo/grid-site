import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  listReservedTerms,
  reserveTerm,
  ReservedError,
  unreserveTerm,
} from "@/lib/reserved-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deny(auth: { ok: false; status: number; error: string }) {
  return NextResponse.json(
    { ok: false, error: auth.error },
    { status: auth.status, headers: { "Cache-Control": "no-store" } },
  );
}

/** GET /api/admin/reserved — list reserved terms + stats */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return deny(auth);

  try {
    const data = await listReservedTerms();
    return NextResponse.json(
      { ok: true, ...data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("[admin/reserved GET]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/reserved
 * { action: "reserve", term, title?, brand?, note? }
 * { action: "unreserve", term }
 */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return deny(auth);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400 },
    );
  }

  const action = String(body.action ?? "").toLowerCase();

  try {
    if (action === "reserve") {
      const term = await reserveTerm({
        term: String(body.term ?? ""),
        title: body.title != null ? String(body.title) : undefined,
        brand: body.brand != null ? String(body.brand) : undefined,
        note: body.note != null ? String(body.note) : undefined,
      });
      return NextResponse.json(
        { ok: true, term },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (action === "unreserve") {
      const result = await unreserveTerm(String(body.term ?? body.id ?? ""));
      return NextResponse.json(
        { ok: true, ...result },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: false, error: "unknown action (reserve|unreserve)" },
      { status: 400 },
    );
  } catch (e) {
    if (e instanceof ReservedError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[admin/reserved POST]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500 },
    );
  }
}
