import { NextResponse } from "next/server";
import { listReservedTerms } from "@/lib/reserved-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/registry/reserved — public list of reserved grid labels
 * (MESH / clients can show logo-only or block registration UX).
 */
export async function GET() {
  try {
    const data = await listReservedTerms();
    // Slim public payload
    const terms = data.terms.map((t) => ({
      term: t.term,
      title: t.title,
      brand: t.brand ?? null,
      source: t.source,
    }));
    return NextResponse.json(
      {
        ok: true,
        updatedAt: data.updatedAt,
        count: terms.length,
        terms,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (e) {
    console.error("[registry/reserved]", e);
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 500 },
    );
  }
}
