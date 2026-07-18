import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  entityAdminStats,
  EntityError,
  listAllEntities,
  setEntityStatus,
  type EntityStatus,
} from "@/lib/entity-store";
import { appendAudit } from "@/lib/compliance-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/entity — Key + Verified applications */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const applications = await listAllEntities();
  const stats = await entityAdminStats();
  return NextResponse.json(
    { ok: true, stats, applications },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * POST /api/admin/entity
 * { action: "set_status", id, status, certJson? }
 */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status },
    );
  }

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
      const status = String(body.status ?? "") as EntityStatus;
      const certJson =
        typeof body.certJson === "string" ? body.certJson : undefined;
      const app = await setEntityStatus(id, status, certJson);
      await appendAudit({
        action: `entity_${status}`,
        actor: "admin",
        gpId: app.gpId,
        realm: app.realm,
        detail: app.tier,
      });
      return NextResponse.json(
        { ok: true, application: app },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: false, error: "unknown action (set_status)" },
      { status: 400 },
    );
  } catch (e) {
    if (e instanceof EntityError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[admin/entity]", e);
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  }
}
