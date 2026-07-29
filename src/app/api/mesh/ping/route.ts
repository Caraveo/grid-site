import { NextResponse } from "next/server";
import { MAX_BODY_BYTES } from "../../../../../workers/mesh-auth/src/protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MeshAuthService = {
  fetch(input: Request): Promise<Response>;
};

async function meshAuthService(): Promise<MeshAuthService | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as CloudflareEnv).MESH_AUTH ?? null;
  } catch {
    return null;
  }
}

function error(message: string, status: number) {
  return NextResponse.json(
    { ok: false, error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

/**
 * POST /api/mesh/ping
 *
 * Public entry point for signed, location-only node heartbeats. The private
 * Cloudflare service binding verifies Ed25519 identity and uses one Durable
 * Object per node for atomic replay protection.
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return error("content-type must be application/json", 415);
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return error("payload too large", 413);
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return error("invalid body", 400);
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return error("payload too large", 413);
  }

  const service = await meshAuthService();
  if (!service) {
    return error("mesh heartbeat authority unavailable", 503);
  }

  try {
    const response = await service.fetch(
      new Request("https://mesh-auth.internal/v1/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw,
      }),
    );
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (cause) {
    console.error("[mesh/ping] heartbeat service failed", cause);
    return error("mesh heartbeat authority unavailable", 503);
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "POST /api/mesh/ping",
    purpose: "Signed location-only heartbeats for the public GRID globe",
    protocol: "GRID-MESH-HEARTBEAT-V1",
    identity: "Ed25519 public key; node id is derived from SHA-256(public key)",
    replayProtection: "per-node Durable Object with SQLite nonce storage",
    privacy: [
      "no IPs, ports, hostnames, wallets, or coordinator URLs are accepted",
      "coordinates are quantized to 0.5 degrees before public storage",
      "private signing keys never leave the node",
    ],
    maxBodyBytes: MAX_BODY_BYTES,
  });
}
