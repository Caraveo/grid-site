/**
 * P2P dial directory — listen multiaddrs for mesh dial (control plane).
 * Separate from compliance (IP/MAC encrypted) and public globe (no endpoints).
 *
 * Used by CLI / MESH to dial by realm without Cloudflare tunnels.
 */

import { isValidGpIdHex, normalizeRealm } from "./gp-id";
import { sanitizeLabel, sanitizeNodeId } from "./sanitize";

const KV_KEY = "gp-p2p-dial-v1";
const MAX_ROWS = 5_000;
const STALE_MS = 1000 * 60 * 30; // 30m without refresh → offline for dial
const MAX_STORE_BYTES = 2_000_000;

export type P2pPeerRecord = {
  id: string;
  gpId: string;
  realm: string;
  nodeId: string;
  label: string;
  /** host:port listen for TCP P2P */
  listen: string;
  class: string;
  lastSeen: string;
  firstSeen: string;
};

type StoreFile = {
  updatedAt: string;
  byGp: Record<string, P2pPeerRecord>;
  byRealm: Record<string, string[]>; // realm → gpIds
};

type MeshKv = {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

let fsMemory: StoreFile | null = null;

async function getKv(): Promise<MeshKv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as { MESH_KV?: MeshKv }).MESH_KV ?? null;
  } catch {
    return null;
  }
}

function emptyStore(): StoreFile {
  return { updatedAt: new Date().toISOString(), byGp: {}, byRealm: {} };
}

/** Strict listen: host:port only, no schemes/paths */
function sanitizeListen(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim().toLowerCase();
  s = s.replace(/^tcp:\/\//, "").replace(/^\/\//, "");
  if (s.includes("/") || s.includes(" ") || s.includes("?")) return null;
  // IPv4:port or hostname:port
  const m = s.match(/^([a-z0-9._-]+|\[?[a-f0-9:]+\]?):(\d{2,5})$/i);
  if (!m) return null;
  const port = Number(m[2]);
  if (!Number.isFinite(port) || port < 1 || port > 65535) return null;
  return `${m[1]}:${port}`;
}

async function loadStore(): Promise<{ store: StoreFile; kv: MeshKv | null }> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(KV_KEY, "text");
    if (raw && raw.length <= MAX_STORE_BYTES) {
      try {
        return { store: scrubStore(JSON.parse(raw) as StoreFile), kv };
      } catch {
        /* fallthrough */
      }
    }
    return { store: emptyStore(), kv };
  }
  if (fsMemory) return { store: fsMemory, kv: null };
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "gp-p2p.json");
    const raw = await fs.readFile(p, "utf8");
    fsMemory = scrubStore(JSON.parse(raw) as StoreFile);
    return { store: fsMemory, kv: null };
  } catch {
    fsMemory = emptyStore();
    return { store: fsMemory, kv: null };
  }
}

function scrubStore(parsed: StoreFile): StoreFile {
  const store = emptyStore();
  for (const r of Object.values(parsed.byGp ?? {})) {
    const s = scrubRow(r);
    if (s) {
      store.byGp[s.gpId] = s;
      const list = store.byRealm[s.realm] ?? [];
      if (!list.includes(s.gpId)) list.push(s.gpId);
      store.byRealm[s.realm] = list;
    }
  }
  return store;
}

function scrubRow(r: P2pPeerRecord): P2pPeerRecord | null {
  if (!isValidGpIdHex(r.gpId)) return null;
  const realm = normalizeRealm(r.realm);
  const listen = sanitizeListen(r.listen);
  if (!realm || !listen) return null;
  return {
    id: String(r.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48),
    gpId: r.gpId,
    realm,
    nodeId: sanitizeNodeId(r.nodeId) ?? "node_unknown",
    label: sanitizeLabel(r.label, realm, 32),
    listen,
    class: ["S", "M", "L"].includes(String(r.class).toUpperCase())
      ? String(r.class).toUpperCase()
      : "S",
    lastSeen: String(r.lastSeen ?? "").slice(0, 40),
    firstSeen: String(r.firstSeen ?? "").slice(0, 40),
  };
}

async function saveStore(store: StoreFile, kv: MeshKv | null): Promise<void> {
  store.updatedAt = new Date().toISOString();
  const payload = JSON.stringify(store);
  if (kv) {
    await kv.put(KV_KEY, payload);
    return;
  }
  fsMemory = store;
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "gp-p2p.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(store, null, 2), "utf8");
  } catch {
    /* ephemeral */
  }
}

export class P2pError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function announceP2p(input: {
  gpId: string;
  realm: string;
  nodeId: string;
  label?: string;
  listen: string;
  class?: string;
}): Promise<P2pPeerRecord> {
  if (!isValidGpIdHex(input.gpId)) {
    throw new P2pError(400, "invalid gpId");
  }
  const realm = normalizeRealm(input.realm);
  if (!realm) throw new P2pError(400, "invalid realm");
  const listen = sanitizeListen(input.listen);
  if (!listen) throw new P2pError(400, "invalid listen (host:port)");

  const { store, kv } = await loadStore();
  const now = new Date().toISOString();
  const existing = store.byGp[input.gpId];
  const row: P2pPeerRecord = {
    id: existing?.id ?? `p2p_${input.gpId.slice(0, 12)}`,
    gpId: input.gpId,
    realm,
    nodeId: sanitizeNodeId(input.nodeId) ?? "node_unknown",
    label: sanitizeLabel(input.label, realm, 32),
    listen,
    class: ["S", "M", "L"].includes(String(input.class ?? "S").toUpperCase())
      ? String(input.class ?? "S").toUpperCase()
      : "S",
    lastSeen: now,
    firstSeen: existing?.firstSeen ?? now,
  };
  store.byGp[row.gpId] = row;
  const list = store.byRealm[realm] ?? [];
  if (!list.includes(row.gpId)) list.push(row.gpId);
  store.byRealm[realm] = list;

  // Cap
  const all = Object.values(store.byGp);
  if (all.length > MAX_ROWS) {
    all
      .sort((a, b) => a.lastSeen.localeCompare(b.lastSeen))
      .slice(0, all.length - MAX_ROWS)
      .forEach((drop) => {
        delete store.byGp[drop.gpId];
        const rl = store.byRealm[drop.realm];
        if (rl) {
          store.byRealm[drop.realm] = rl.filter((g) => g !== drop.gpId);
        }
      });
  }

  await saveStore(store, kv);
  return row;
}

function fresh(r: P2pPeerRecord): boolean {
  const t = Date.parse(r.lastSeen);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < STALE_MS;
}

export async function resolveDial(opts: {
  realm?: string;
  gpId?: string;
}): Promise<{
  peers: Array<{
    gpId: string;
    realm: string;
    nodeId: string;
    label: string;
    listen: string;
    class: string;
    lastSeen: string;
    online: boolean;
    gridUrl: string;
  }>;
}> {
  const { store } = await loadStore();
  let rows: P2pPeerRecord[] = [];
  if (opts.gpId && isValidGpIdHex(opts.gpId)) {
    const r = store.byGp[opts.gpId];
    if (r) rows = [r];
  } else if (opts.realm) {
    const realm = normalizeRealm(opts.realm);
    if (realm) {
      const ids = store.byRealm[realm] ?? [];
      rows = ids.map((id) => store.byGp[id]).filter(Boolean) as P2pPeerRecord[];
    }
  }
  return {
    peers: rows.map((r) => ({
      gpId: r.gpId,
      realm: r.realm,
      nodeId: r.nodeId,
      label: r.label,
      listen: r.listen,
      class: r.class,
      lastSeen: r.lastSeen,
      online: fresh(r),
      gridUrl: `grid://${r.realm}.grid`,
    })),
  };
}
