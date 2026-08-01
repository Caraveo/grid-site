/**
 * Key ($300) + Verified Entity ($10k) applications.
 * Cash App $Caraveo + note + admin confirm (same rail as name registration).
 * Permanent cert metadata stored after approve (revocable).
 */

import {
  feeForTier,
  isValidGpIdHex,
  KEY_FEE_USD,
  normalizeRealm,
  type CertTier,
  VERIFIED_ENTITY_FEE_USD,
} from "./gp-id";
import { CASH_APP_CASHTAG, cashAppPayUrl } from "./registration-store";
import { sanitizeLabel, sanitizeNodeId } from "./sanitize";
import nacl from "tweetnacl";

const KV_KEY = "gp-entity-v1";
const MAX_ROWS = 5_000;
const MAX_STORE_BYTES = 2_000_000;

export type EntityStatus =
  | "pending_payment"
  | "pending_review"
  | "active"
  | "rejected"
  | "revoked";

export type EntityApplication = {
  id: string;
  tier: CertTier;
  realm: string;
  gpId: string;
  pubkeyHex: string;
  nodeId: string;
  /** Display name for Verified Entity */
  entityName?: string;
  status: EntityStatus;
  feeUsd: number;
  paymentNote: string;
  cashConfirm?: string;
  /** Permanent cert payload after approve (JSON string) */
  certJson?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type StoreFile = {
  updatedAt: string;
  byId: Record<string, EntityApplication>;
  /** realm+tier → id */
  byRealmTier: Record<string, string>;
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
  return { updatedAt: new Date().toISOString(), byId: {}, byRealmTier: {} };
}

function rtKey(realm: string, tier: CertTier): string {
  return `${realm}::${tier}`;
}

function scrub(a: EntityApplication): EntityApplication | null {
  const realm = normalizeRealm(a.realm);
  if (!realm) return null;
  if (a.tier !== "key" && a.tier !== "verified") return null;
  if (!isValidGpIdHex(a.gpId)) return null;
  const pubkeyHex = String(a.pubkeyHex ?? "")
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "")
    .slice(0, 64);
  if (pubkeyHex.length !== 64) return null;
  const status = (
    [
      "pending_payment",
      "pending_review",
      "active",
      "rejected",
      "revoked",
    ] as const
  ).includes(a.status as EntityStatus)
    ? (a.status as EntityStatus)
    : "pending_payment";
  return {
    id: String(a.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40),
    tier: a.tier,
    realm,
    gpId: a.gpId,
    pubkeyHex,
    nodeId: sanitizeNodeId(a.nodeId) ?? "node_unknown",
    entityName: a.entityName
      ? sanitizeLabel(a.entityName, "", 64)
      : undefined,
    status,
    feeUsd:
      typeof a.feeUsd === "number" ? a.feeUsd : feeForTier(a.tier),
    paymentNote: sanitizeLabel(a.paymentNote, "", 40)
      .replace(/\s/g, "-")
      .slice(0, 40),
    cashConfirm: a.cashConfirm
      ? sanitizeLabel(a.cashConfirm, "", 64)
      : undefined,
    certJson: a.certJson ? String(a.certJson).slice(0, 8192) : undefined,
    revokedAt: a.revokedAt?.slice(0, 40),
    createdAt: String(a.createdAt ?? "").slice(0, 40),
    updatedAt: String(a.updatedAt ?? "").slice(0, 40),
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
        for (const r of Object.values(parsed.byId ?? {})) {
          const s = scrub(r);
          if (s) {
            store.byId[s.id] = s;
            store.byRealmTier[rtKey(s.realm, s.tier)] = s.id;
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
    const p = path.join(process.cwd(), "data", "gp-entity.json");
    const raw = await fs.readFile(p, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    const store = emptyStore();
    for (const r of Object.values(parsed.byId ?? {})) {
      const s = scrub(r);
      if (s) {
        store.byId[s.id] = s;
        store.byRealmTier[rtKey(s.realm, s.tier)] = s.id;
      }
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
    const p = path.join(process.cwd(), "data", "gp-entity.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(store, null, 2), "utf8");
  } catch {
    /* ephemeral */
  }
}

function makeId(tier: CertTier): string {
  const a = Math.random().toString(36).slice(2, 8);
  const b = Date.now().toString(36).slice(-4);
  return `${tier === "key" ? "key" : "ent"}_${b}${a}`;
}

function paymentNoteFor(id: string, tier: CertTier, realm: string): string {
  const code = id.replace(/^(key|ent)_/, "").slice(0, 8).toUpperCase();
  const tag = tier === "key" ? "KEY" : "VER";
  return `GRID-${tag}-${realm}-${code}`.slice(0, 40);
}

export class EntityError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function entityFees() {
  return {
    key: KEY_FEE_USD,
    verified: VERIFIED_ENTITY_FEE_USD,
    cashtag: `$${CASH_APP_CASHTAG}`,
  };
}

export async function startEntityApplication(input: {
  tier: CertTier;
  realm: string;
  gpId: string;
  pubkeyHex: string;
  nodeId?: string;
  entityName?: string;
}): Promise<{
  application: EntityApplication;
  cashAppUrl: string;
  cashtag: string;
  feeUsd: number;
  instructions: string[];
}> {
  const tier = input.tier;
  if (tier !== "key" && tier !== "verified") {
    throw new EntityError(400, "tier must be key or verified");
  }
  const realm = normalizeRealm(input.realm);
  if (!realm) throw new EntityError(400, "invalid realm");
  if (!isValidGpIdHex(input.gpId)) {
    throw new EntityError(400, "invalid gpId (128 hex from CLI)");
  }
  const pubkeyHex = String(input.pubkeyHex ?? "")
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "");
  if (pubkeyHex.length !== 64) {
    throw new EntityError(400, "pubkeyHex must be 64 hex chars");
  }
  if (tier === "verified") {
    const n = sanitizeLabel(input.entityName, "", 64);
    if (n.length < 2) {
      throw new EntityError(400, "entityName required for Verified Entity");
    }
  }

  const { store, kv } = await loadStore();
  const existingId = store.byRealmTier[rtKey(realm, tier)];
  if (existingId) {
    const ex = store.byId[existingId];
    if (ex && (ex.status === "active" || ex.status === "pending_review" || ex.status === "pending_payment")) {
      throw new EntityError(
        409,
        `Already have ${tier} application for ${realm} (${ex.status})`,
      );
    }
  }

  const feeUsd = feeForTier(tier);
  const id = makeId(tier);
  const now = new Date().toISOString();
  const note = paymentNoteFor(id, tier, realm);
  const app: EntityApplication = {
    id,
    tier,
    realm,
    gpId: input.gpId,
    pubkeyHex,
    nodeId: sanitizeNodeId(input.nodeId) ?? "node_unknown",
    entityName:
      tier === "verified"
        ? sanitizeLabel(input.entityName, "", 64)
        : undefined,
    status: "pending_payment",
    feeUsd,
    paymentNote: note,
    createdAt: now,
    updatedAt: now,
  };
  store.byId[id] = app;
  store.byRealmTier[rtKey(realm, tier)] = id;

  const ids = Object.keys(store.byId);
  if (ids.length > MAX_ROWS) {
    /* rare — drop oldest rejected */
    const drop = Object.values(store.byId)
      .filter((x) => x.status === "rejected")
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))[0];
    if (drop) {
      delete store.byId[drop.id];
    }
  }

  await saveStore(store, kv);
  const cashAppUrl = cashAppPayUrl(feeUsd, note);
  return {
    application: app,
    cashAppUrl,
    cashtag: `$${CASH_APP_CASHTAG}`,
    feeUsd,
    instructions: [
      `Send $${feeUsd.toFixed(2)} via Cash App to $${CASH_APP_CASHTAG}`,
      `Use note exactly: ${note}`,
      `Then confirm: grid entity confirm ${id}`,
      tier === "key"
        ? "After admin approve you receive a permanent [Key] cert bound to this realm."
        : "After admin review + approve you receive a permanent [Verified] entity cert.",
    ],
  };
}

export async function confirmEntityPayment(
  id: string,
  cashConfirm?: string,
): Promise<EntityApplication> {
  const clean = String(id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  const { store, kv } = await loadStore();
  const app = store.byId[clean];
  if (!app) throw new EntityError(404, "application not found");
  if (app.status === "active") return app;
  if (app.status === "revoked") {
    throw new EntityError(400, "revoked — start a new application");
  }
  app.cashConfirm = cashConfirm
    ? sanitizeLabel(cashConfirm, "", 64)
    : app.cashConfirm;
  app.status = "pending_review";
  app.updatedAt = new Date().toISOString();
  store.byId[clean] = app;
  await saveStore(store, kv);
  return app;
}

export async function getEntity(id: string): Promise<EntityApplication | null> {
  const clean = String(id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  const { store } = await loadStore();
  return store.byId[clean] ?? null;
}

export async function listAllEntities(): Promise<EntityApplication[]> {
  const { store } = await loadStore();
  return Object.values(store.byId).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

/** Public badge lookup by realm — no secrets, no gp wire form. */
export async function publicTierForRealm(realmRaw: string): Promise<{
  realm: string;
  key: boolean;
  verified: boolean;
} | null> {
  const realm = normalizeRealm(realmRaw);
  if (!realm) return null;
  const { store } = await loadStore();
  let key = false;
  let verified = false;
  for (const a of Object.values(store.byId)) {
    if (a.realm !== realm || a.status !== "active") continue;
    if (a.tier === "key") key = true;
    if (a.tier === "verified") {
      key = true;
      verified = true;
    }
  }
  return { realm, key, verified };
}

export async function setEntityStatus(
  id: string,
  status: EntityStatus,
  certJson?: string,
): Promise<EntityApplication> {
  const clean = String(id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  const { store, kv } = await loadStore();
  const app = store.byId[clean];
  if (!app) throw new EntityError(404, "not found");
  app.status = status;
  app.updatedAt = new Date().toISOString();
  if (status === "active") {
    if (certJson) {
      app.certJson = certJson.slice(0, 8192);
    } else {
      // Auto-issue permanent CA cert on approve
      try {
        const { issueCertificate } = await import("./gp-ca");
        const cert = issueCertificate(app);
        app.certJson = JSON.stringify(cert).slice(0, 8192);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "CA issue failed";
        throw new EntityError(503, msg);
      }
    }
  }
  if (status === "revoked") {
    app.revokedAt = app.updatedAt;
    // Keep certJson for audit; clients check status=revoked
  }
  store.byId[clean] = app;
  await saveStore(store, kv);
  return app;
}

/** Active cert for realm (highest tier wins). */
export async function getActiveCertForRealm(
  realmRaw: string,
): Promise<{ application: EntityApplication; cert: unknown } | null> {
  const realm = normalizeRealm(realmRaw);
  if (!realm) return null;
  const { store } = await loadStore();
  const active = Object.values(store.byId).filter(
    (a) => a.realm === realm && a.status === "active" && a.certJson,
  );
  if (active.length === 0) return null;
  // Prefer verified over key
  active.sort((a, b) => {
    if (a.tier === b.tier) return 0;
    return a.tier === "verified" ? -1 : 1;
  });
  const app = active[0]!;
  try {
    return { application: app, cert: JSON.parse(app.certJson!) };
  } catch {
    return { application: app, cert: app.certJson };
  }
}

function systemRealmSeed(): Uint8Array | null {
  const raw = String(process.env.GRID_SYSTEM_REALM_SEED ?? "")
    .trim()
    .toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(raw)) return null;
  return hexToBytes(raw);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function ensureSystemRealmCertificate(): Promise<{
  application: EntityApplication;
  cert: unknown;
} | null> {
  const seed = systemRealmSeed();
  if (!seed) return null;

  const { store, kv } = await loadStore();
  const existing = store.byId.system_grid_root;
  if (existing?.status === "active" && existing.certJson) {
    return { application: existing, cert: JSON.parse(existing.certJson) };
  }

  const keyPair = nacl.sign.keyPair.fromSeed(seed);
  const now = new Date().toISOString();
  const application: EntityApplication = {
    id: "system_grid_root",
    tier: "verified",
    realm: "grid",
    gpId: bytesToHex(nacl.hash(keyPair.publicKey)),
    pubkeyHex: bytesToHex(keyPair.publicKey),
    nodeId: "grid-root",
    entityName: "GRID",
    status: "active",
    feeUsd: 0,
    paymentNote: "system realm",
    createdAt: now,
    updatedAt: now,
  };
  const { issueCertificate } = await import("./gp-ca");
  application.certJson = JSON.stringify(issueCertificate(application));
  store.byId[application.id] = application;
  store.byRealmTier[rtKey(application.realm, application.tier)] = application.id;
  await saveStore(store, kv);
  return { application, cert: JSON.parse(application.certJson) };
}

export async function entityAdminStats(): Promise<Record<string, number>> {
  const all = await listAllEntities();
  const stats: Record<string, number> = {
    total: all.length,
    pending_payment: 0,
    pending_review: 0,
    active: 0,
    rejected: 0,
    revoked: 0,
    key: 0,
    verified: 0,
  };
  for (const a of all) {
    stats[a.status] = (stats[a.status] ?? 0) + 1;
    if (a.tier === "key") stats.key = (stats.key ?? 0) + 1;
    if (a.tier === "verified") stats.verified = (stats.verified ?? 0) + 1;
  }
  return stats;
}
