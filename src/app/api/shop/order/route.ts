import { NextResponse } from "next/server";
import {
  OrderError,
  getOrder,
  publicOrder,
  startOrder,
  submitPayment,
} from "@/lib/order-store";
import {
  SHOP_BTC_ADDRESS,
  SHOP_CASHTAG_HANDLE,
  SHOP_PRICE_USD,
  SHOP_PRODUCTS,
  SHOP_SIZES,
} from "@/lib/shop-products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cors = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

/** GET — catalog + payment defaults, or order status by id */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404, headers: cors },
      );
    }
    return NextResponse.json(
      { ok: true, order: publicOrder(order) },
      { headers: cors },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      feeUsd: SHOP_PRICE_USD,
      cashtag: SHOP_CASHTAG_HANDLE,
      btcAddress: SHOP_BTC_ADDRESS,
      sizes: SHOP_SIZES,
      products: SHOP_PRODUCTS.map((p) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        tagline: p.tagline,
        image: p.image,
      })),
    },
    { headers: cors },
  );
}

/**
 * POST
 * { action: "start", productId, size, email, name?, phone?, shipping? }
 * { action: "submit_payment", id, paymentMethod: cash_app|bitcoin, cashConfirm?, btcTxid? }
 */
export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400, headers: cors },
    );
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json(
      { ok: false, error: "body must be object" },
      { status: 400, headers: cors },
    );
  }

  const body = parsed as Record<string, unknown>;
  const action = String(body.action ?? "start").toLowerCase();

  try {
    if (action === "start") {
      const result = await startOrder({
        productId: String(body.productId ?? ""),
        size: String(body.size ?? ""),
        email: String(body.email ?? ""),
        name: body.name != null ? String(body.name) : undefined,
        phone: body.phone != null ? String(body.phone) : undefined,
        shipping: body.shipping != null ? String(body.shipping) : undefined,
      });
      return NextResponse.json(
        {
          ok: true,
          step: "pay",
          order: publicOrder(result.order),
          cashAppUrl: result.cashAppUrl,
          cashtag: result.cashtag,
          btcAddress: result.btcAddress,
          feeUsd: result.feeUsd,
          instructions: result.instructions,
          payment: {
            method: "cash_app_or_bitcoin",
            cashtag: result.cashtag,
            feeUsd: result.feeUsd,
            note: result.order.paymentNote,
            cashAppUrl: result.cashAppUrl,
            btcAddress: result.btcAddress,
          },
        },
        { status: 201, headers: cors },
      );
    }

    if (action === "submit_payment" || action === "confirm") {
      const order = await submitPayment({
        id: String(body.id ?? ""),
        paymentMethod: String(body.paymentMethod ?? "cash_app"),
        cashConfirm:
          body.cashConfirm != null ? String(body.cashConfirm) : undefined,
        btcTxid: body.btcTxid != null ? String(body.btcTxid) : undefined,
      });
      return NextResponse.json(
        {
          ok: true,
          step: "tracked",
          order: publicOrder(order),
          message:
            "Payment submitted. Your order is now in the fulfillment queue.",
        },
        { headers: cors },
      );
    }

    return NextResponse.json(
      { ok: false, error: "unknown action (start|submit_payment)" },
      { status: 400, headers: cors },
    );
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json(
        { ok: false, error: e.message },
        { status: e.status, headers: cors },
      );
    }
    console.error("[shop/order]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500, headers: cors },
    );
  }
}
