/**
 * Mesh peer store — location-only globe pings.
 *
 * Storage backends (first match wins):
 * 1. Cloudflare KV (`MESH_KV` binding) — durable production store
 * 2. Local `data/mesh-store.json` — Node / next dev fallback
 *
 * Never stores IPs, ports, hostnames, wallets, or coordinator URLs.
 */

import {
  type NodeClass,
  type NodeStatus,
  type PublicNode,
  quantizeCoord,
  shortId,
} from "./network";
import {
  sanitizeClass,
  sanitizeLabel,
  sanitizeLatLng,
  sanitizeNodeId,
  sanitizeRegion,
  sanitizeStatus,
} from "./sanitize";

const KV_KEY = "mesh-store-v1";
const PING_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const RECENT_PING_MS = 1000 * 45; // celebrate / ring for 45s
const MAX_PEERS = 500;
const MAX_BODY_BYTES = 4_096;
const MAX_STORE_BYTES = 2_000_000;

export type PingInput = {
  nodeId: string;
  label?: string;
  class?: string;
  region?: string;
  status?: string;
  lat: number;
  lng: number;
};

export type StoredPing = PublicNode & {
  lat: number;
  lng: number;
  firstPingAt: string;
  pingCount: number;
};

export type MeshStoreFile = {
  phase: string;
  updatedAt: string;
  genesis: StoredPing;
  peers: Record<string, StoredPing>;
};

/** FS-only warm cache (never used as source of truth when KV is available). */
let fsMemory: MeshStoreFile | null = null;

type MeshKv = {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

async function getMeshKv(): Promise<MeshKv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as { MESH_KV?: MeshKv }).MESH_KV;
    return kv ?? null;
  } catch {
    // Outside Workers / before platform proxy is ready
    return null;
  }
}

function envStr(key: string, fallback = ""): string {
  try {
    // Prefer process.env (populated from bindings + .env in OpenNext/Node)
    const v = process.env[key];
    if (v != null && String(v).length > 0) return String(v);
  } catch {
    /* ignore */
  }
  return fallback;
}

function defaultGenesis(): StoredPing {
  const coords = sanitizeLatLng(
    envStr("GENESIS_LAT", "37.5"),
    envStr("GENESIS_LNG", "-122.0"),
  ) ?? { lat: 37.5, lng: -122 };
  const lat = quantizeCoord(coords.lat);
  const lng = quantizeCoord(coords.lng);
  const now = new Date().toISOString();
  return {
    id: "genesis",
    label: sanitizeLabel(envStr("GENESIS_LABEL", "GENESIS"), "GENESIS", 32),
    class: "L",
    region: sanitizeRegion(envStr("GENESIS_REGION", "Origin")),
    status: "online",
    role: "genesis",
    lat,
    lng,
    joinedAt: now,
    lastSeen: now,
    firstPingAt: now,
    pingCount: 1,
  };
}

function emptyStore(): MeshStoreFile {
  return {
    phase:
      sanitizeRegion(envStr("GRID_PHASE", "1")).replace("—", "0").slice(0, 8) ||
      "1",
    updatedAt: new Date().toISOString(),
    genesis: defaultGenesis(),
    peers: {},
  };
}

function scrubStoredPeer(
  p: StoredPing,
  opts?: { allowGenesis?: boolean },
): StoredPing | null {
  const id = sanitizeNodeId(p.id, 64, { allowGenesis: opts?.allowGenesis });
  if (!id) return null;
  const latlng = sanitizeLatLng(p.lat, p.lng);
  if (!latlng) return null;
  const isGenesis = id === "genesis" || p.role === "genesis";
  return {
    id: isGenesis ? "genesis" : id,
    label: sanitizeLabel(p.label, isGenesis ? "GENESIS" : shortId(id), 32),
    class: sanitizeClass(p.class) as NodeClass,
    region: sanitizeRegion(p.region),
    status: sanitizeStatus(p.status) as NodeStatus,
    role: isGenesis ? "genesis" : "peer",
    lat: quantizeCoord(latlng.lat),
    lng: quantizeCoord(latlng.lng),
    joinedAt: typeof p.joinedAt === "string" ? p.joinedAt.slice(0, 40) : undefined,
    lastSeen: typeof p.lastSeen === "string" ? p.lastSeen.slice(0, 40) : undefined,
    firstPingAt:
      typeof p.firstPingAt === "string"
        ? p.firstPingAt.slice(0, 40)
        : new Date().toISOString(),
    pingCount:
      typeof p.pingCount === "number" && Number.isFinite(p.pingCount)
        ? Math.min(Math.max(0, Math.floor(p.pingCount)), 1_000_000)
        : 1,
  };
}

function parseAndScrub(raw: string): MeshStoreFile {
  if (raw.length > MAX_STORE_BYTES) return emptyStore();
  let parsed: MeshStoreFile;
  try {
    parsed = JSON.parse(raw) as MeshStoreFile;
  } catch {
    return emptyStore();
  }
  const store = emptyStore();
  if (parsed.genesis) {
    const g = scrubStoredPeer(
      { ...parsed.genesis, role: "genesis" } as StoredPing,
      { allowGenesis: true },
    );
    if (g) {
      store.genesis = {
        ...g,
        id: "genesis",
        role: "genesis",
        label: sanitizeLabel(g.label, "GENESIS"),
      };
    }
  }
  store.peers = {};
  for (const p of Object.values(parsed.peers ?? {})) {
    const scrubbed = scrubStoredPeer(p);
    if (scrubbed) store.peers[scrubbed.id] = scrubbed;
  }
  store.updatedAt =
    typeof parsed.updatedAt === "string"
      ? parsed.updatedAt.slice(0, 40)
      : store.updatedAt;
  if (typeof parsed.phase === "string") {
    store.phase =
      String(parsed.phase).replace(/[^0-9a-zA-Z._-]/g, "").slice(0, 8) ||
      store.phase;
  }
  return store;
}

async function loadFromFs(): Promise<MeshStoreFile> {
  if (fsMemory) return fsMemory;
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const storePath = path.join(process.cwd(), "data", "mesh-store.json");
    const raw = await fs.readFile(storePath, "utf8");
    fsMemory = parseAndScrub(raw);
    return fsMemory;
  } catch {
    fsMemory = emptyStore();
    return fsMemory;
  }
}

async function saveToFs(store: MeshStoreFile): Promise<void> {
  fsMemory = store;
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const storePath = path.join(process.cwd(), "data", "mesh-store.json");
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // ephemeral / read-only FS
  }
}

async function ensureLoaded(): Promise<{
  store: MeshStoreFile;
  backend: "kv" | "fs";
  kv: MeshKv | null;
}> {
  const kv = await getMeshKv();
  if (kv) {
    const raw = await kv.get(KV_KEY, "text");
    if (raw) {
      return { store: parseAndScrub(raw), backend: "kv", kv };
    }
    const store = emptyStore();
    return { store, backend: "kv", kv };
  }
  const store = await loadFromFs();
  return { store, backend: "fs", kv: null };
}

async function persist(
  store: MeshStoreFile,
  backend: "kv" | "fs",
  kv: MeshKv | null,
): Promise<void> {
  const payload = JSON.stringify(store);
  if (backend === "kv" && kv) {
    await kv.put(KV_KEY, payload);
    return;
  }
  await saveToFs(store);
}

/** @deprecated use filterPingBody from sanitize — kept for route import compat */
export { filterPingBody as stripSensitive } from "./sanitize";

export type PingResult = {
  ok: true;
  isNew: boolean;
  node: StoredPing;
  message: string;
};

export async function upsertPing(input: PingInput): Promise<PingResult> {
  const coords = sanitizeLatLng(input.lat, input.lng);
  if (!coords) {
    throw new MeshError(400, "lat/lng required and must be valid WGS84");
  }

  const id = sanitizeNodeId(input.nodeId);
  if (!id) {
    throw new MeshError(400, "invalid nodeId");
  }

  const { store, backend, kv } = await ensureLoaded();
  const now = new Date().toISOString();
  const lat = quantizeCoord(coords.lat);
  const lng = quantizeCoord(coords.lng);
  const existing = store.peers[id];
  const isNew = !existing;

  const label = sanitizeLabel(
    input.label ?? existing?.label ?? shortId(id),
    shortId(id),
    32,
  );
  const nodeClass = sanitizeClass(input.class ?? existing?.class) as NodeClass;
  const region = sanitizeRegion(input.region ?? existing?.region ?? "—");
  const status = sanitizeStatus(input.status ?? "online") as NodeStatus;

  const node: StoredPing = {
    id,
    label,
    class: nodeClass,
    region,
    status,
    role: "peer",
    lat,
    lng,
    joinedAt: existing?.joinedAt ?? existing?.firstPingAt ?? now,
    lastSeen: now,
    firstPingAt: existing?.firstPingAt ?? now,
    pingCount: Math.min((existing?.pingCount ?? 0) + 1, 1_000_000),
  };

  store.peers[id] = node;
  store.updatedAt = now;
  store.genesis.lastSeen = now;

  // Cap peer map (drop oldest lastSeen)
  const ids = Object.keys(store.peers);
  if (ids.length > MAX_PEERS) {
    const sorted = ids
      .map((k) => store.peers[k])
      .sort(
        (a, b) =>
          Date.parse(a.lastSeen ?? a.firstPingAt) -
          Date.parse(b.lastSeen ?? b.firstPingAt),
      );
    for (let i = 0; i < sorted.length - MAX_PEERS; i++) {
      delete store.peers[sorted[i].id];
    }
  }

  // Prune very stale
  const cutoff = Date.now() - PING_TTL_MS;
  for (const [k, p] of Object.entries(store.peers)) {
    if (Date.parse(p.lastSeen ?? p.firstPingAt) < cutoff) {
      delete store.peers[k];
    }
  }

  await persist(store, backend, kv);

  const message = isNew
    ? `Welcome to the mesh, ${label}. You're a node.`
    : `Pulse received, ${label}. Still on the mesh.`;

  return { ok: true, isNew, node, message };
}

export async function getPublicMesh() {
  const { store } = await ensureLoaded();
  const now = Date.now();
  const peers = Object.values(store.peers)
    .map((p) => scrubStoredPeer(p))
    .filter((p): p is StoredPing => p != null)
    .sort(
      (a, b) =>
        Date.parse(b.lastSeen ?? b.firstPingAt) -
        Date.parse(a.lastSeen ?? a.firstPingAt),
    );

  const nodes: PublicNode[] = [
    publicView(store.genesis),
    ...peers.map((p) => publicView(p)),
  ];

  const recentPings = peers
    .filter((p) => Date.parse(p.lastSeen ?? p.firstPingAt) > now - RECENT_PING_MS)
    .slice(0, 24)
    .map((p) => ({
      id: p.id,
      label: p.label,
      lat: p.lat,
      lng: p.lng,
      at: p.lastSeen ?? p.firstPingAt,
      isNew:
        Date.parse(p.firstPingAt) > now - RECENT_PING_MS && p.pingCount <= 2,
    }));

  return {
    phase:
      String(store.phase ?? "1").replace(/[^0-9a-zA-Z._-]/g, "").slice(0, 8) ||
      "1",
    updatedAt: store.updatedAt,
    genesis: publicView(store.genesis),
    nodes,
    peers: peers.map((p) => publicView(p)),
    recentPings,
    stats: {
      total: nodes.length,
      online: nodes.filter((n) => n.status === "online").length,
      peers: peers.length,
    },
  };
}

function publicView(n: StoredPing): PublicNode {
  const id = n.role === "genesis" ? "genesis" : sanitizeNodeId(n.id) ?? "peer";
  return {
    id,
    label: sanitizeLabel(n.label, shortId(id), 32),
    class: sanitizeClass(n.class),
    region: sanitizeRegion(n.region),
    status: sanitizeStatus(n.status),
    role: n.role === "genesis" ? "genesis" : "peer",
    joinedAt: typeof n.joinedAt === "string" ? n.joinedAt.slice(0, 40) : undefined,
    lastSeen: typeof n.lastSeen === "string" ? n.lastSeen.slice(0, 40) : undefined,
    lat: Number.isFinite(n.lat) ? quantizeCoord(n.lat) : undefined,
    lng: Number.isFinite(n.lng) ? quantizeCoord(n.lng) : undefined,
  };
}

export class MeshError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  // Web Crypto subtle.timingSafeEqual is not available everywhere;
  // constant-time XOR fold works for equal-length secrets.
  let diff = 0;
  for (let i = 0; i < aa.length; i++) {
    diff |= aa[i] ^ bb[i];
  }
  return diff === 0;
}

export function verifyWebhookSecret(req: Request): boolean {
  const expected = envStr("GRID_WEBHOOK_SECRET");
  const expectedService = envStr("MESH_SERVICE_SECRET");
  // Local dev: allow open if secret not set. Production must set the secret.
  if (!expected) {
    return envStr("NODE_ENV") !== "production";
  }
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = (req.headers.get("x-grid-secret") ?? "").trim();
  const serviceHeader = (req.headers.get("x-grid-service-secret") ?? "").trim();
  if (bearer && timingSafeEqualString(bearer, expected)) return true;
  if (header && timingSafeEqualString(header, expected)) return true;
  if (
    expectedService &&
    serviceHeader &&
    timingSafeEqualString(serviceHeader, expectedService)
  ) {
    return true;
  }
  return false;
}

export { MAX_BODY_BYTES };
