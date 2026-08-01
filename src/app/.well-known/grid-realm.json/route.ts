import { systemRealmManifest } from "@/lib/realm-manifest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const manifest = await systemRealmManifest();
  if (!manifest) {
    return Response.json(
      { ok: false, error: "system realm identity is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
