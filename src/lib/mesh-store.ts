import { promises as fs } from "fs";
import path from "path";
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

const STORE_PATH = path.join(process.cwd(), "data", "mesh-store.json");
const PING_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const RECENT_PING_MS = 1000 * 45; // celebrate / ring for 45s
const MAX_PEERS = 500;
const MAX_BODY_BYTES = 4_096;

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

// Process-local cache (helps serverless warm instances)
let memory: MeshStoreFile | null = null;

function defaultGenesis(): StoredPing {
  const coords = sanitizeLatLng(
    process.env.GENESIS_LAT ?? "37.5",
    process.env.GENESIS_LNG ?? "-122.0",
  ) ?? { lat: 37.5, lng: -122 };
  const lat = quantizeCoord(coords.lat);
  const lng = quantizeCoord(coords.lng);
  const now = new Date().toISOString();
  return {
    id: "genesis",
    label: sanitizeLabel(process.env.GENESIS_LABEL ?? "GENESIS", "GENESIS", 32),
    class: "L",
    region: sanitizeRegion(process.env.GENESIS_REGION ?? "Origin"),
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
    phase: sanitizeRegion(process.env.GRID_PHASE ?? "0").replace("—", "0").slice(0, 8) || "0",
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

async function ensureLoaded(): Promise<MeshStoreFile> {
  if (memory) return memory;
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    if (raw.length > 2_000_000) {
      memory = emptyStore();
      return memory;
    }
    const parsed = JSON.parse(raw) as MeshStoreFile;
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
    for (const [k, p] of Object.entries(parsed.peers ?? {})) {
      const scrubbed = scrubStoredPeer(p);
      if (scrubbed) store.peers[scrubbed.id] = scrubbed;
      void k;
    }
    store.updatedAt =
      typeof parsed.updatedAt === "string"
        ? parsed.updatedAt.slice(0, 40)
        : store.updatedAt;
    memory = store;
    return memory;
  } catch {
    memory = emptyStore();
    await persist(memory).catch(() => {
      /* ephemeral envs (some serverless) can't write disk */
    });
    return memory;
  }
}

async function persist(store: MeshStoreFile): Promise<void> {
  memory = store;
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Serverless without FS: memory-only until cold start
  }
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

  const store = await ensureLoaded();
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

  await persist(store);

  // Message uses already-sanitized label only
  const message = isNew
    ? `Welcome to the mesh, ${label}. You're a node.`
    : `Pulse received, ${label}. Still on the mesh.`;

  return { ok: true, isNew, node, message };
}

export async function getPublicMesh() {
  const store = await ensureLoaded();
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
    phase: String(store.phase ?? "0").replace(/[^0-9a-zA-Z._-]/g, "").slice(0, 8) || "0",
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
  // Re-sanitize on every read so poisoned disk never reaches the UI
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

export function verifyWebhookSecret(req: Request): boolean {
  const expected = process.env.GRID_WEBHOOK_SECRET;
  // Local dev: allow open if secret not set
  if (!expected) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = req.headers.get("x-grid-secret") ?? "";
  // Constant-time-ish compare for equal-length secrets
  if (bearer.length === expected.length && bearer === expected) return true;
  if (header.length === expected.length && header === expected) return true;
  return false;
}

export { MAX_BODY_BYTES };
