import { DurableObject } from "cloudflare:workers";
import {
  HeartbeatError,
  MAX_BODY_BYTES,
  assertFresh,
  nodeIdForPublicKey,
  parseHeartbeat,
  verifyHeartbeatSignature,
} from "./protocol";

const NODE_KEY_PREFIX = "mesh-node-v2:";
const NODE_TTL_SECONDS = 14 * 24 * 60 * 60;
const NONCE_RETENTION_MS = 10 * 60 * 1000;
const MIN_PING_INTERVAL_MS = 15 * 1000;

interface Env {
  NODE_HEARTBEATS: DurableObjectNamespace<NodeHeartbeat>;
  MESH_KV: KVNamespace;
}

interface AcceptInput {
  nonce: string;
  issuedAtMs: number;
  acceptedAtMs: number;
}

interface AcceptResult {
  accepted: boolean;
  reason?: "replay" | "rate_limited";
  firstSeenMs: number;
  pingCount: number;
}

interface PublicHeartbeatNode {
  id: string;
  label: string;
  class: "S" | "M" | "L";
  region: string;
  status: "online" | "syncing" | "idle" | "offline";
  role: "peer";
  lat: number;
  lng: number;
  joinedAt: string;
  lastSeen: string;
  firstPingAt: string;
  pingCount: number;
  authVersion: 1;
}

export class NodeHeartbeat extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS heartbeat_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          first_seen_ms INTEGER NOT NULL,
          last_seen_ms INTEGER NOT NULL,
          ping_count INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS seen_nonces (
          nonce TEXT PRIMARY KEY,
          issued_at_ms INTEGER NOT NULL
        );
      `);
    });
  }

  acceptHeartbeat(input: AcceptInput): AcceptResult {
    return this.ctx.storage.transactionSync(() => {
      const sql = this.ctx.storage.sql;
      sql.exec(
        "DELETE FROM seen_nonces WHERE issued_at_ms < ?",
        input.acceptedAtMs - NONCE_RETENTION_MS,
      );

      const replay = sql
        .exec<{ nonce: string }>(
          "SELECT nonce FROM seen_nonces WHERE nonce = ? LIMIT 1",
          input.nonce,
        )
        .toArray();
      const state = sql
        .exec<{
          first_seen_ms: number;
          last_seen_ms: number;
          ping_count: number;
        }>(
          "SELECT first_seen_ms, last_seen_ms, ping_count FROM heartbeat_state WHERE id = 1",
        )
        .toArray()[0];

      if (replay.length > 0) {
        return {
          accepted: false,
          reason: "replay",
          firstSeenMs: state?.first_seen_ms ?? input.acceptedAtMs,
          pingCount: state?.ping_count ?? 0,
        };
      }
      if (
        state &&
        input.acceptedAtMs - state.last_seen_ms < MIN_PING_INTERVAL_MS
      ) {
        return {
          accepted: false,
          reason: "rate_limited",
          firstSeenMs: state.first_seen_ms,
          pingCount: state.ping_count,
        };
      }

      sql.exec(
        "INSERT INTO seen_nonces (nonce, issued_at_ms) VALUES (?, ?)",
        input.nonce,
        input.issuedAtMs,
      );
      if (state) {
        sql.exec(
          "UPDATE heartbeat_state SET last_seen_ms = ?, ping_count = ping_count + 1 WHERE id = 1",
          input.acceptedAtMs,
        );
        return {
          accepted: true,
          firstSeenMs: state.first_seen_ms,
          pingCount: state.ping_count + 1,
        };
      }

      sql.exec(
        "INSERT INTO heartbeat_state (id, first_seen_ms, last_seen_ms, ping_count) VALUES (1, ?, ?, 1)",
        input.acceptedAtMs,
        input.acceptedAtMs,
      );
      return {
        accepted: true,
        firstSeenMs: input.acceptedAtMs,
        pingCount: 1,
      };
    });
  }
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function heartbeat(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "content-type must be application/json" }, 415);
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload too large" }, 413);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload too large" }, 413);
  }

  try {
    const body = parseHeartbeat(JSON.parse(raw) as unknown);
    assertFresh(body);
    if (!(await verifyHeartbeatSignature(body))) {
      throw new HeartbeatError(401, "invalid heartbeat signature");
    }

    const nodeId = await nodeIdForPublicKey(body.publicKey);
    const acceptedAtMs = Date.now();
    const authority = env.NODE_HEARTBEATS.getByName(nodeId);
    const result = await authority.acceptHeartbeat({
      nonce: body.nonce,
      issuedAtMs: body.issuedAtMs,
      acceptedAtMs,
    });
    if (!result.accepted) {
      const status = result.reason === "rate_limited" ? 429 : 409;
      return json({ ok: false, error: result.reason }, status);
    }

    // Coordinates are deliberately quantized to 0.5° before public storage.
    const quantize = (value: number) => Math.round(value / 0.5) * 0.5;
    const now = new Date(acceptedAtMs).toISOString();
    const firstSeen = new Date(result.firstSeenMs).toISOString();
    const node: PublicHeartbeatNode = {
      id: nodeId,
      label: body.label,
      class: body.class,
      region: body.region,
      status: body.status,
      role: "peer",
      lat: quantize(body.latE4 / 10_000),
      lng: quantize(body.lngE4 / 10_000),
      joinedAt: firstSeen,
      lastSeen: now,
      firstPingAt: firstSeen,
      pingCount: Math.min(result.pingCount, 1_000_000),
      authVersion: 1,
    };
    await env.MESH_KV.put(
      `${NODE_KEY_PREFIX}${nodeId}`,
      JSON.stringify(node),
      { expirationTtl: NODE_TTL_SECONDS },
    );

    return json(
      {
        ok: true,
        isNew: result.pingCount === 1,
        auth: "ed25519-v1",
        node,
      },
      result.pingCount === 1 ? 201 : 200,
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json({ ok: false, error: "invalid JSON" }, 400);
    }
    if (error instanceof HeartbeatError) {
      return json({ ok: false, error: error.message }, error.status);
    }
    console.error("mesh heartbeat rejected", error);
    return json({ ok: false, error: "heartbeat verification failed" }, 400);
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        ok: true,
        service: "grid-mesh-auth",
        auth: "ed25519-v1",
        replayProtection: "durable-object-sqlite",
      });
    }
    if (request.method === "POST" && url.pathname === "/v1/heartbeat") {
      return heartbeat(request, env);
    }
    return json({ ok: false, error: "not found" }, 404);
  },
} satisfies ExportedHandler<Env>;

