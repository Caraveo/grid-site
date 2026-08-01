import { systemRealmWire } from "@/lib/realm-manifest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const wire = await systemRealmWire();
  if (!wire) {
    return new Response("GRID realm identity is not configured\n", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain" },
    });
  }
  return new Response(wire, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
