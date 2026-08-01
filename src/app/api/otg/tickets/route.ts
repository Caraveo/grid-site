import { NextResponse } from "next/server";
import {
  Otg27OrderError,
  startOtg27Order,
  submitOtg27Payment,
} from "@/lib/otg27-order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "start");

    if (action === "start") {
      const result = await startOtg27Order({
        ticketId: String(body.ticketId ?? ""),
        quantity: Number(body.quantity ?? 1),
        name: String(body.name ?? ""),
        email: String(body.email ?? ""),
        organization:
          body.organization == null ? undefined : String(body.organization),
      });
      return NextResponse.json({ ok: true, ...result }, { status: 201, headers });
    }

    if (action === "submit_payment") {
      const order = await submitOtg27Payment({
        id: String(body.id ?? ""),
        paymentMethod: String(body.paymentMethod ?? ""),
        paymentReference:
          body.paymentReference == null
            ? undefined
            : String(body.paymentReference),
      });
      return NextResponse.json({ ok: true, order }, { headers });
    }

    return NextResponse.json(
      { ok: false, error: "Unknown action." },
      { status: 400, headers },
    );
  } catch (error) {
    if (error instanceof Otg27OrderError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status, headers },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Could not create ticket order." },
      { status: 500, headers },
    );
  }
}
