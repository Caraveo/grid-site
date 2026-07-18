/**
 * Public compute capacity registry (grid-compute.com).
 *
 * Safe fields only — never IPs, ports, hostnames, wallets, or coordinator URLs.
 * Durable via MESH_KV (same binding as mesh peers) or local FS fallback.
 */

import {
  sanitizeClass,
  sanitizeLabel,
  sanitizeNodeId,
} from "./sanitize";

const KV_KEY = "compute-registry-v1";
const MAX_COMPUTES = 1_000;
const STALE_MS = 1000 * 60 * 5; // unavailable after 5m without heartbeat
const PRUNE_MS = 1000 * 60 * 60 * 24 * 7; // drop after 7d
const MAX_BODY_BYTES = 8_192;
const MAX_STORE_BYTES = 2_000_000;

export type ComputeVisibility = "public" | "private";
export type ComputeAvailStatus = "available" | "busy" | "offline";

export type PublicCompute = {
  id: string;
  name: string;
  nodeId: string;
  label: string;
  image: string;
  visibility: ComputeVisibility;
  class: string;
  backend: string;
  replicas: number;
  freeSlots: number;
  status: ComputeAvailStatus;
  lastSeen: string;
  firstSeen: string;
};

export type ComputeAnnounceInput = {
  nodeId: string;
  label?: string;
  computes: Array<{
    name: string;
    image?: string;
    visibility?: string;
    class?: string;
    backend?: string;
    replicas?: number;
    freeSlots?: number;
    status?: string;
  }>;
};

type StoreFile = {
  updatedAt: string;
  computes: Record<string, PublicCompute>;
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
  return { updatedAt: new Date().toISOString(), computes: {} };
}

function sanitizeImage(raw: unknown): string {
  if (typeof raw !== "string") return "alpine:3.20";
  let s = raw.trim().slice(0, 128);
  // repo:tag or repo@sha256:hex — no paths, no schemes
  if (/[<>`\\/\s]/.test(s) || s.includes("://") || s.includes("..")) {
    return "alpine:3.20";
  }
  s = s.replace(/[^a-zA-Z0-9_.:@\/-]/g, "");
  if (s.length < 3) return "alpine:3.20";
  return s;
}

function sanitizeVisibility(raw: unknown): ComputeVisibility {
  const s = String(raw ?? "private").toLowerCase();
  return s === "public" ? "public" : "private";
}

function sanitizeBackend(raw: unknown): string {
  const s = String(raw ?? "docker")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 16);
  if (s === "k8s" || s === "kubernetes" || s === "docker") return s === "kubernetes" ? "k8s" : s;
  return "docker";
}

function clampSlots(n: unknown, fallback = 0): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(Math.max(0, Math.floor(x)), 256);
}

function sanitizeComputeName(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 48);
  if (s.length < 1 || s === "genesis") return null;
  return s;
}

function deriveStatus(freeSlots: number, lastSeenIso: string): ComputeAvailStatus {
  const age = Date.now() - Date.parse(lastSeenIso);
  if (!Number.isFinite(age) || age > STALE_MS) return "offline";
  if (freeSlots <= 0) return "busy";
  return "available";
}

function scrubCompute(c: PublicCompute): PublicCompute | null {
  const nodeId = sanitizeNodeId(c.nodeId);
  const name = sanitizeComputeName(c.name);
  if (!nodeId || !name) return null;
  const freeSlots = clampSlots(c.freeSlots, 0);
  const replicas = clampSlots(c.replicas, 1) || 1;
  const lastSeen =
    typeof c.lastSeen === "string" ? c.lastSeen.slice(0, 40) : new Date().toISOString();
  const firstSeen =
    typeof c.firstSeen === "string" ? c.firstSeen.slice(0, 40) : lastSeen;
  return {
    id: `${nodeId}:${name}`,
    name,
    nodeId,
    label: sanitizeLabel(c.label, name, 32),
    image: sanitizeImage(c.image),
    visibility: sanitizeVisibility(c.visibility),
    class: sanitizeClass(c.class),
    backend: sanitizeBackend(c.backend),
    replicas,
    freeSlots,
    status: deriveStatus(freeSlots, lastSeen),
    lastSeen,
    firstSeen,
  };
}

async function loadStore(): Promise<{ store: StoreFile; kv: MeshKv | null }> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(KV_KEY, "text");
    if (raw && raw.length <= MAX_STORE_BYTES) {
      try {
        const parsed = JSON.parse(raw) as StoreFile;
        const store = emptyStore();
        store.updatedAt =
          typeof parsed.updatedAt === "string"
            ? parsed.updatedAt.slice(0, 40)
            : store.updatedAt;
        for (const c of Object.values(parsed.computes ?? {})) {
          const scrubbed = scrubCompute(c as PublicCompute);
          if (scrubbed) store.computes[scrubbed.id] = scrubbed;
        }
        return { store, kv };
      } catch {
        /* fall through */
      }
    }
    return { store: emptyStore(), kv };
  }

  if (fsMemory) return { store: fsMemory, kv: null };
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "compute-registry.json");
    const raw = await fs.readFile(p, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    const store = emptyStore();
    for (const c of Object.values(parsed.computes ?? {})) {
      const scrubbed = scrubCompute(c as PublicCompute);
      if (scrubbed) store.computes[scrubbed.id] = scrubbed;
    }
    fsMemory = store;
    return { store, kv: null };
  } catch {
    fsMemory = emptyStore();
    return { store: fsMemory, kv: null };
  }
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
    const p = path.join(process.cwd(), "data", "compute-registry.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(store, null, 2), "utf8");
  } catch {
    /* ephemeral */
  }
}

export async function upsertComputes(input: ComputeAnnounceInput): Promise<{
  ok: true;
  count: number;
  computes: PublicCompute[];
}> {
  const nodeId = sanitizeNodeId(input.nodeId);
  if (!nodeId) {
    throw new ComputeError(400, "invalid nodeId");
  }
  if (!Array.isArray(input.computes) || input.computes.length === 0) {
    throw new ComputeError(400, "computes array required");
  }
  if (input.computes.length > 32) {
    throw new ComputeError(400, "max 32 computes per announce");
  }

  const { store, kv } = await loadStore();
  const now = new Date().toISOString();
  const label = sanitizeLabel(input.label, shortNode(nodeId), 32);
  const updated: PublicCompute[] = [];

  // Only actively registered names may appear / be announced on the public registry
  const { getActiveRegistration } = await import("./registration-store");
  const rejected: string[] = [];

  for (const raw of input.computes) {
    const name = sanitizeComputeName(raw.name);
    if (!name) continue;

    const reg = await getActiveRegistration(name);
    if (!reg || !reg.kinds.includes("compute")) {
      rejected.push(name);
      continue;
    }

    const freeSlots = clampSlots(raw.freeSlots, 0);
    const replicas = clampSlots(raw.replicas, 1) || 1;
    const id = `${nodeId}:${name}`;
    const existing = store.computes[id];
    const rec: PublicCompute = {
      id,
      name,
      nodeId,
      label: sanitizeLabel(reg.label || label, name, 32),
      image: sanitizeImage(raw.image ?? existing?.image),
      visibility: sanitizeVisibility(raw.visibility ?? existing?.visibility),
      class: sanitizeClass(raw.class ?? reg.class ?? existing?.class ?? "S"),
      backend: sanitizeBackend(raw.backend ?? existing?.backend),
      replicas,
      freeSlots,
      status: deriveStatus(freeSlots, now),
      lastSeen: now,
      firstSeen: existing?.firstSeen ?? now,
    };
    store.computes[id] = rec;
    updated.push(rec);
  }

  if (updated.length === 0 && rejected.length > 0) {
    throw new ComputeError(
      402,
      `Compute name(s) not activated on registry.grid: ${rejected.join(", ")}. Pay $5 Cash App to $Caraveo with your registration note → confirm → admin approve. Donations accepted at $Caraveo. (Prevents abuse · funds review employment.)`,
    );
  }

  // Cap map
  const ids = Object.keys(store.computes);
  if (ids.length > MAX_COMPUTES) {
    const sorted = ids
      .map((k) => store.computes[k])
      .sort((a, b) => Date.parse(a.lastSeen) - Date.parse(b.lastSeen));
    for (let i = 0; i < sorted.length - MAX_COMPUTES; i++) {
      delete store.computes[sorted[i].id];
    }
  }

  // Prune ancient
  const pruneBefore = Date.now() - PRUNE_MS;
  for (const [k, c] of Object.entries(store.computes)) {
    if (Date.parse(c.lastSeen) < pruneBefore) delete store.computes[k];
  }

  await saveStore(store, kv);
  return { ok: true, count: updated.length, computes: updated };
}

export async function getPublicComputes(opts?: {
  availableOnly?: boolean;
  visibility?: "public" | "private" | "all";
  /** Default true: only names with active registry.grid registration */
  registeredOnly?: boolean;
}): Promise<{
  registry: string;
  updatedAt: string;
  availableMs: number;
  computes: PublicCompute[];
  stats: {
    total: number;
    available: number;
    busy: number;
    offline: number;
    freeSlots: number;
  };
}> {
  const { store } = await loadStore();
  const now = Date.now();
  let list = Object.values(store.computes)
    .map((c) => scrubCompute(c))
    .filter((c): c is PublicCompute => c != null)
    .map((c) => ({
      ...c,
      status: deriveStatus(c.freeSlots, c.lastSeen),
    }));

  const registeredOnly = opts?.registeredOnly !== false;
  if (registeredOnly) {
    const { getActiveNameSet, listActiveRegistrations } = await import(
      "./registration-store"
    );
    const active = await listActiveRegistrations();
    const computeNames = new Set(
      active.filter((r) => r.kinds.includes("compute")).map((r) => r.name),
    );
    // Also keep names that were active set (compat)
    const names = computeNames.size
      ? computeNames
      : await getActiveNameSet();
    list = list.filter((c) => names.has(c.name.toLowerCase()));
  }

  const vis = opts?.visibility ?? "all";
  if (vis === "public" || vis === "private") {
    list = list.filter((c) => c.visibility === vis);
  }
  if (opts?.availableOnly) {
    list = list.filter((c) => c.status === "available");
  }

  list.sort((a, b) => Date.parse(b.lastSeen) - Date.parse(a.lastSeen));

  const stats = {
    total: list.length,
    available: list.filter((c) => c.status === "available").length,
    busy: list.filter((c) => c.status === "busy").length,
    offline: list.filter((c) => c.status === "offline").length,
    freeSlots: list
      .filter((c) => c.status === "available")
      .reduce((s, c) => s + c.freeSlots, 0),
  };

  return {
    registry: "https://grid-compute.com",
    updatedAt: store.updatedAt || new Date(now).toISOString(),
    availableMs: STALE_MS,
    computes: list,
    stats,
  };
}

function shortNode(id: string): string {
  return id.replace(/^node[_-]?/i, "").slice(0, 8).toUpperCase();
}

export class ComputeError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export { MAX_BODY_BYTES as COMPUTE_MAX_BODY_BYTES };

/** Allowlist keys for announce body */
export function filterComputeAnnounceBody(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if ("nodeId" in raw) out.nodeId = raw.nodeId;
  if ("id" in raw && !("nodeId" in out)) out.nodeId = raw.id;
  if ("label" in raw) out.label = raw.label;
  if ("name" in raw) out.label = raw.label ?? raw.name;
  if (Array.isArray(raw.computes)) {
    out.computes = raw.computes
      .filter((x) => x && typeof x === "object" && !Array.isArray(x))
      .slice(0, 32)
      .map((item) => {
        const o = item as Record<string, unknown>;
        const c: Record<string, unknown> = {};
        for (const k of [
          "name",
          "image",
          "visibility",
          "class",
          "backend",
          "replicas",
          "freeSlots",
          "status",
        ]) {
          if (k in o && (typeof o[k] === "string" || typeof o[k] === "number")) {
            c[k] = o[k];
          }
        }
        return c;
      });
  }
  return out;
}

