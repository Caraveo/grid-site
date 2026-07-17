import { NextResponse } from "next/server";
import { adminSecretConfigured, requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/session — am I logged in? */
export async function GET(req: Request) {
  if (!adminSecretConfigured()) {
    return NextResponse.json(
      { ok: false, authenticated: false, configured: false },
      { status: 503 },
    );
  }
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: true, authenticated: false, configured: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { ok: true, authenticated: true, configured: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
