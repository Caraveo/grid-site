import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  OrderError,
  deleteOrder,
  listOrders,
  orderStats,
  setOrderStatus,
  type OrderStatus,
} from "@/lib/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deny(auth: { ok: false; status: number; error: string }) {
  return NextResponse.json(
    { ok: false, error: auth.error },
    { status: auth.status, headers: { "Cache-Control": "no-store" } },
  );
}

/** GET /api/admin/orders — tracked orders + stats */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return deny(auth);

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") ?? "") as OrderStatus | "";
  const includeUntracked = url.searchParams.get("all") === "1";

  const orders = await listOrders({
    status: status || undefined,
    includeUntracked,
  });
  const stats = await orderStats();

  return NextResponse.json(
    { ok: true, stats, orders },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * POST /api/admin/orders
 * { action: "set_status", id, status }
 * { action: "delete", id }
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
  const id = String(body.id ?? "");

  try {
    if (action === "set_status") {
      const status = String(body.status ?? "") as OrderStatus;
      const order = await setOrderStatus(id, status);
      return NextResponse.json(
        { ok: true, order },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (action === "delete") {
      await deleteOrder(id);
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
    if (e instanceof OrderError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status },
      );
    }
    console.error("[admin/orders]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500 },
    );
  }
}
