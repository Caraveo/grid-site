import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  deleteOtg27Order,
  listOtg27Orders,
  Otg27OrderError,
  otg27OrderStats,
  setOtg27OrderStatus,
  type Otg27Order,
} from "@/lib/otg27-order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

function deny(auth: { ok: false; status: number; error: string }) {
  return NextResponse.json(
    { ok: false, error: auth.error },
    { status: auth.status, headers: noStore },
  );
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return deny(auth);
  const url = new URL(request.url);
  const status = url.searchParams.get("status") as
    | Otg27Order["status"]
    | null;
  const orders = await listOtg27Orders({
    status: status || undefined,
    includePending: url.searchParams.get("all") === "1",
  });
  return NextResponse.json(
    { ok: true, orders, stats: await otg27OrderStats() },
    { headers: noStore },
  );
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return deny(auth);
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");
    const id = String(body.id ?? "");
    if (action === "set_status") {
      const order = await setOtg27OrderStatus(
        id,
        String(body.status ?? "") as Otg27Order["status"],
      );
      return NextResponse.json({ ok: true, order }, { headers: noStore });
    }
    if (action === "delete") {
      await deleteOtg27Order(id);
      return NextResponse.json({ ok: true, deleted: id }, { headers: noStore });
    }
    return NextResponse.json(
      { ok: false, error: "Unknown action." },
      { status: 400, headers: noStore },
    );
  } catch (error) {
    if (error instanceof Otg27OrderError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status, headers: noStore },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Could not update ticket order." },
      { status: 500, headers: noStore },
    );
  }
}
