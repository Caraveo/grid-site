/**
 * Public node / compute name registration (paid via Cash App $Caraveo only).
 * Safe fields only — never IPs, ports, hostnames, or wallets other than cashtag config.
 */

import {
  sanitizeClass,
  sanitizeLabel,
  sanitizeNodeId,
  sanitizeRegion,
} from "./sanitize";
import { isTermReserved } from "./reserved-store";

const KV_KEY = "name-registrations-v1";
const MAX_REG = 5_000;
const MAX_STORE_BYTES = 2_000_000;

export const CASH_APP_CASHTAG = "Caraveo"; // payments to $Caraveo
export const CASH_APP_HANDLE = `$${CASH_APP_CASHTAG}`;

export function registrationFeeUsd(): number {
  const n = Number(process.env.REGISTRATION_FEE_USD ?? "5");
  if (!Number.isFinite(n) || n < 1) return 5;
  return Math.min(Math.max(1, Math.round(n * 100) / 100), 500);
}

export function cashAppPayUrl(amountUsd: number, note: string): string {
  // Cash App deep link: https://cash.app/$Cashtag/amount
  const amt = amountUsd.toFixed(2);
  const q = encodeURIComponent(note.slice(0, 60));
  return `https://cash.app/$${CASH_APP_CASHTAG}/${amt}?note=${q}`;
}

export type RegStatus = "pending_payment" | "pending_review" | "active" | "rejected";

/** What the entity registers for on registry.grid */
export type RegKind = "node" | "compute";

export type NameRegistration = {
  id: string;
  name: string;
  nodeId: string;
  label: string;
  class: string;
  region: string;
  /** Must include at least one of node | compute */
  kinds: RegKind[];
  status: RegStatus;
  feeUsd: number;
  paymentNote: string;
  /** Operator-provided Cash App confirmation (honor system until reviewed). */
  cashConfirm?: string;
  /** WebAuthn credential id (base64url) */
  passkeyCredId?: string;
  hasPasskey?: boolean;
  createdAt: string;
  updatedAt: string;
};

export function sanitizeKinds(raw: unknown): RegKind[] {
  const out = new Set<RegKind>();
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[,\s]+/)
      : [];
  for (const x of list) {
    const s = String(x).toLowerCase().trim();
    if (s === "node" || s === "miner" || s === "host") out.add("node");
    if (s === "compute" || s === "container" || s === "workload") out.add("compute");
  }
  // default both for legacy records
  if (out.size === 0) {
    out.add("node");
    out.add("compute");
  }
  return [...out];
}

type StoreFile = {
  updatedAt: string;
  byId: Record<string, NameRegistration>;
  /** lowercase name → id */
  byName: Record<string, string>;
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
  return { updatedAt: new Date().toISOString(), byId: {}, byName: {} };
}

function sanitizeComputeName(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
  if (s.length < 2 || s.length > 32) return null;
  if (s === "genesis" || s === "home" || s === "registry" || s === "grid") {
    return null;
  }
  // reserved browser builtins
  const reserved = new Set([
    "home",
    "start",
    "newtab",
    "registry",
    "mesh",
    "peers",
    "computes",
    "status",
    "about",
    "help",
    "docs",
    "settings",
    "config",
    "prefs",
    "error",
    "www",
    "api",
    "admin",
  ]);
  if (reserved.has(s)) return null;
  return s;
}

function scrub(r: NameRegistration): NameRegistration | null {
  const name = sanitizeComputeName(r.name);
  if (!name) return null;
  const nodeId =
    sanitizeNodeId(r.nodeId) ??
    `node_${name}_${r.id.replace(/[^a-z0-9]/gi, "").slice(0, 8)}`;
  return {
    id: String(r.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40),
    name,
    nodeId,
    label: sanitizeLabel(r.label, name, 32),
    class: sanitizeClass(r.class),
    region: sanitizeRegion(r.region),
    kinds: sanitizeKinds((r as NameRegistration).kinds),
    status: (["pending_payment", "pending_review", "active", "rejected"] as const).includes(
      r.status as RegStatus,
    )
      ? (r.status as RegStatus)
      : "pending_payment",
    feeUsd: typeof r.feeUsd === "number" ? r.feeUsd : registrationFeeUsd(),
    paymentNote: sanitizeLabel(r.paymentNote, "", 40).replace(/\s/g, "-").slice(0, 40),
    cashConfirm: r.cashConfirm
      ? sanitizeLabel(r.cashConfirm, "", 64)
      : undefined,
    passkeyCredId: r.passkeyCredId
      ? String(r.passkeyCredId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 256)
      : undefined,
    hasPasskey: !!(r.passkeyCredId || r.hasPasskey),
    createdAt: String(r.createdAt ?? "").slice(0, 40),
    updatedAt: String(r.updatedAt ?? "").slice(0, 40),
  };
}

export async function attachPasskeyToRegistration(
  id: string,
  credId: string,
): Promise<NameRegistration> {
  const clean = String(id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!clean) throw new RegError(400, "id required");
  const { store, kv } = await loadStore();
  const reg = store.byId[clean];
  if (!reg) throw new RegError(404, "registration not found");
  reg.passkeyCredId = String(credId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 256);
  reg.hasPasskey = true;
  reg.updatedAt = new Date().toISOString();
  store.byId[clean] = reg;
  await saveStore(store, kv);
  return reg;
}

async function loadStore(): Promise<{ store: StoreFile; kv: MeshKv | null }> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(KV_KEY, "text");
    if (raw && raw.length <= MAX_STORE_BYTES) {
      try {
        const parsed = JSON.parse(raw) as StoreFile;
        const store = emptyStore();
        for (const r of Object.values(parsed.byId ?? {})) {
          const s = scrub(r);
          if (s) {
            store.byId[s.id] = s;
            store.byName[s.name] = s.id;
          }
        }
        store.updatedAt =
          typeof parsed.updatedAt === "string"
            ? parsed.updatedAt.slice(0, 40)
            : store.updatedAt;
        return { store, kv };
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
    const p = path.join(process.cwd(), "data", "registrations.json");
    const raw = await fs.readFile(p, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    const store = emptyStore();
    for (const r of Object.values(parsed.byId ?? {})) {
      const s = scrub(r);
      if (s) {
        store.byId[s.id] = s;
        store.byName[s.name] = s.id;
      }
    }
    fsMemory = store;
    return { store, kv: null };
  } catch {
    fsMemory = emptyStore();
    return { store: fsMemory, kv: null };
  }
}

function kvWriteErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  const lower = msg.toLowerCase();
  // Cloudflare free tier daily write cap → Workers surface this as put failures
  if (
    lower.includes("10048") ||
    lower.includes("free usage limit") ||
    lower.includes("limit for this operation") ||
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("quota")
  ) {
    return "Registry storage write limit reached for today (Cloudflare free tier). Try again after UTC midnight, or upgrade the Cloudflare plan.";
  }
  if (lower.includes("not found") || lower.includes("10013")) {
    return "Registry storage binding missing or misconfigured (MESH_KV).";
  }
  return msg ? `Registry save failed: ${msg.slice(0, 180)}` : "Registry save failed";
}

async function saveStore(store: StoreFile, kv: MeshKv | null): Promise<void> {
  store.updatedAt = new Date().toISOString();
  const payload = JSON.stringify(store);
  if (kv) {
    try {
      await kv.put(KV_KEY, payload);
      return;
    } catch (e) {
      console.error("[registration-store] MESH_KV.put failed", e);
      throw new RegError(503, kvWriteErrorMessage(e));
    }
  }
  fsMemory = store;
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "registrations.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(store, null, 2), "utf8");
  } catch (e) {
    console.error("[registration-store] fs save failed", e);
    // Workers without KV would lose data — fail loudly so we never pretend success
    throw new RegError(
      503,
      "Registry storage unavailable (no MESH_KV binding and disk write failed).",
    );
  }
}

function makeId(): string {
  const a = Math.random().toString(36).slice(2, 8);
  const b = Date.now().toString(36).slice(-4);
  return `reg_${b}${a}`;
}

function paymentNoteFor(id: string, name: string): string {
  // Short code for Cash App note field
  const code = id.replace("reg_", "").slice(0, 10).toUpperCase();
  return `GRID-${name}-${code}`.slice(0, 40);
}

export class RegError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function startRegistration(input: {
  name: string;
  label?: string;
  class?: string;
  region?: string;
  nodeId?: string;
  kinds?: unknown;
}): Promise<{
  registration: NameRegistration;
  cashAppUrl: string;
  cashtag: string;
  feeUsd: number;
  instructions: string[];
}> {
  const name = sanitizeComputeName(input.name);
  if (!name) {
    throw new RegError(
      400,
      "Invalid name (2–32 chars, a-z 0-9 _ -; reserved names blocked)",
    );
  }

  if (await isTermReserved(name)) {
    throw new RegError(
      409,
      `Name «${name}» is reserved and cannot be registered`,
    );
  }

  const kinds = sanitizeKinds(input.kinds);
  if (kinds.length === 0) {
    throw new RegError(400, "Select at least one: node and/or compute");
  }

  const { store, kv } = await loadStore();
  if (store.byName[name]) {
    throw new RegError(409, `Name «${name}» is already registered or reserved`);
  }

  const feeUsd = registrationFeeUsd();
  const id = makeId();
  const now = new Date().toISOString();
  const note = paymentNoteFor(id, name);
  const nodeId =
    sanitizeNodeId(input.nodeId) ??
    `node_${name}_${id.replace(/[^a-z0-9]/gi, "").slice(-6)}`;

  const registration: NameRegistration = {
    id,
    name,
    nodeId,
    label: sanitizeLabel(input.label ?? name, name, 32),
    class: sanitizeClass(input.class ?? "S"),
    region: sanitizeRegion(input.region ?? "—"),
    kinds,
    status: "pending_payment",
    feeUsd,
    paymentNote: note,
    createdAt: now,
    updatedAt: now,
  };

  store.byId[id] = registration;
  store.byName[name] = id;

  // Cap
  const ids = Object.keys(store.byId);
  if (ids.length > MAX_REG) {
    const sorted = ids
      .map((k) => store.byId[k])
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    for (let i = 0; i < sorted.length - MAX_REG; i++) {
      const drop = sorted[i];
      delete store.byId[drop.id];
      if (store.byName[drop.name] === drop.id) delete store.byName[drop.name];
    }
  }

  await saveStore(store, kv);

  const cashAppUrl = cashAppPayUrl(feeUsd, note);
  return {
    registration,
    cashAppUrl,
    cashtag: CASH_APP_HANDLE,
    feeUsd,
    instructions: [
      `Pay exactly $${feeUsd.toFixed(2)} USD with Cash App only.`,
      `Send to ${CASH_APP_HANDLE} (Cash App).`,
      `Put this exact note: ${note}`,
      "No other payment methods are accepted.",
      "Fee prevents name spam / abuse and funds review employment.",
      `Donations accepted at ${CASH_APP_HANDLE} anytime (any amount).`,
      "After paying, return here and confirm to submit for review.",
    ],
  };
}

export async function confirmPayment(input: {
  id: string;
  cashConfirm?: string;
}): Promise<NameRegistration> {
  const id = String(input.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) throw new RegError(400, "registration id required");

  const { store, kv } = await loadStore();
  const reg = store.byId[id];
  if (!reg) throw new RegError(404, "registration not found");
  if (reg.status === "active") return reg;
  if (reg.status === "rejected") {
    throw new RegError(400, "registration was rejected");
  }

  reg.status = "pending_review";
  reg.cashConfirm = input.cashConfirm
    ? sanitizeLabel(input.cashConfirm, "", 64)
    : undefined;
  reg.updatedAt = new Date().toISOString();
  store.byId[id] = reg;
  await saveStore(store, kv);
  return reg;
}

export async function getRegistration(id: string): Promise<NameRegistration | null> {
  const { store } = await loadStore();
  return store.byId[id] ?? null;
}

export async function checkNameAvailable(name: string): Promise<{
  name: string | null;
  available: boolean;
  reason?: string;
}> {
  const n = sanitizeComputeName(name);
  if (!n) {
    return { name: null, available: false, reason: "invalid name" };
  }
  const { store } = await loadStore();
  if (store.byName[n]) {
    return { name: n, available: false, reason: "taken" };
  }
  return { name: n, available: true };
}

/** Public directory of registrations (no payment secrets beyond note codes). */
export async function listPublicRegistrations(): Promise<{
  feeUsd: number;
  cashtag: string;
  registrations: Array<{
    name: string;
    label: string;
    class: string;
    region: string;
    status: RegStatus;
    createdAt: string;
  }>;
}> {
  const { store } = await loadStore();
  const registrations = Object.values(store.byId)
    .filter((r) => r.status === "active" || r.status === "pending_review")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 200)
    .map((r) => ({
      name: r.name,
      label: r.label,
      class: r.class,
      region: r.region,
      kinds: r.kinds,
      status: r.status,
      createdAt: r.createdAt,
    }));

  return {
    feeUsd: registrationFeeUsd(),
    cashtag: CASH_APP_HANDLE,
    registrations,
  };
}

/** Active paid registrations only — source of truth for registry.grid */
export async function listActiveRegistrations(): Promise<NameRegistration[]> {
  const { store } = await loadStore();
  return Object.values(store.byId)
    .filter((r) => r.status === "active")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getActiveNameSet(): Promise<Set<string>> {
  const active = await listActiveRegistrations();
  return new Set(active.map((r) => r.name.toLowerCase()));
}

export async function isNameActivelyRegistered(name: string): Promise<boolean> {
  const n = sanitizeComputeName(name);
  if (!n) return false;
  const { store } = await loadStore();
  const id = store.byName[n];
  if (!id) return false;
  return store.byId[id]?.status === "active";
}

export async function getActiveRegistration(
  name: string,
): Promise<NameRegistration | null> {
  const n = sanitizeComputeName(name);
  if (!n) return null;
  const { store } = await loadStore();
  const id = store.byName[n];
  if (!id) return null;
  const r = store.byId[id];
  if (!r || r.status !== "active") return null;
  return r;
}

/** Admin: full registration list including payment notes / confirms. */
export async function listAllRegistrations(): Promise<NameRegistration[]> {
  const { store } = await loadStore();
  return Object.values(store.byId).sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
}

export async function setRegistrationStatus(
  id: string,
  status: RegStatus,
): Promise<NameRegistration> {
  const clean = String(id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!clean) throw new RegError(400, "id required");
  if (
    !["pending_payment", "pending_review", "active", "rejected"].includes(status)
  ) {
    throw new RegError(400, "invalid status");
  }

  const { store, kv } = await loadStore();
  const reg = store.byId[clean];
  if (!reg) throw new RegError(404, "registration not found");

  reg.status = status;
  reg.updatedAt = new Date().toISOString();
  store.byId[clean] = reg;

  // Rejected names can be re-registered later
  if (status === "rejected") {
    if (store.byName[reg.name] === clean) {
      delete store.byName[reg.name];
    }
  } else {
    store.byName[reg.name] = clean;
  }

  await saveStore(store, kv);
  return reg;
}

export async function deleteRegistration(id: string): Promise<void> {
  const clean = String(id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!clean) throw new RegError(400, "id required");
  const { store, kv } = await loadStore();
  const reg = store.byId[clean];
  if (!reg) throw new RegError(404, "registration not found");
  delete store.byId[clean];
  if (store.byName[reg.name] === clean) delete store.byName[reg.name];
  await saveStore(store, kv);
}

export async function adminStats(): Promise<{
  total: number;
  pending_payment: number;
  pending_review: number;
  active: number;
  rejected: number;
}> {
  const all = await listAllRegistrations();
  return {
    total: all.length,
    pending_payment: all.filter((r) => r.status === "pending_payment").length,
    pending_review: all.filter((r) => r.status === "pending_review").length,
    active: all.filter((r) => r.status === "active").length,
    rejected: all.filter((r) => r.status === "rejected").length,
  };
}
