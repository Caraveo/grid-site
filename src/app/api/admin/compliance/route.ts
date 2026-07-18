import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { requireStepup } from "@/lib/admin-stepup";
import {
  appendAudit,
  listAudit,
  listForAdmin,
} from "@/lib/compliance-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/compliance?page=1&pageSize=25&decrypt=1
 *
 * decrypt=1 requires forensics step-up. Without it, returns metadata only
 * (grid:// realm, gp_id, machine_ref) — no IP/MAC.
 */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "25");
  const wantDecrypt =
    url.searchParams.get("decrypt") === "1" ||
    url.searchParams.get("decrypt") === "true";

  let decrypt = false;
  if (wantDecrypt) {
    const step = await requireStepup(req);
    if (!step.ok) {
      return NextResponse.json(
        { ok: false, error: step.error, needStepup: true },
        { status: step.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    decrypt = true;
    await appendAudit({
      action: "compliance_list_decrypt",
      actor: "admin",
      detail: `page=${page}`,
    });
  }

  const data = await listForAdmin({ page, pageSize, decrypt });
  const audit = await listAudit(30);

  return NextResponse.json(
    { ok: true, ...data, audit },
    { headers: { "Cache-Control": "no-store" } },
  );
}
