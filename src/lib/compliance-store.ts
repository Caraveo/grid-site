/**
 * Admin-only compliance vault: encrypted IP/MAC for forensics.
 * Never exposed on public registry / mesh APIs.
 *
 * Encryption: AES-GCM with GRID_COMPLIANCE_KEY (32+ byte secret, base64 or utf8).
 * Decrypt requires admin session + passkey step-up (see admin routes).
 */

import { isValidGpIdHex, normalizeRealm } from "./gp-id";
import { sanitizeLabel, sanitizeNodeId } from "./sanitize";

const KV_KEY = "gp-compliance-v1";
const AUDIT_KEY = "gp-compliance-audit-v1";
const MAX_ROWS = 10_000;
const MAX_STORE_BYTES = 4_000_000;
const MAX_AUDIT = 5_000;

export type ComplianceRow = {
  id: string;
  gpId: string;
  realm: string;
  nodeId: string;
  /** Machine reference only — not part of gp_id */
  machineRef: string;
  /** AES-GCM ciphertext (base64) of JSON { ip, mac } */
  sealed: string;
  consentVersion: string;
  collectedAt: string;
  updatedAt: string;
  bodyHash?: string;
  signature?: string;
};

export type CompliancePlain = {
  ip: string;
  mac: string;
};

export type AuditEntry = {
  at: string;
  action: string;
  gpId?: string;
  realm?: string;
  actor: string;
  detail?: string;
};

type StoreFile = {
  updatedAt: string;
  byId: Record<string, ComplianceRow>;
  /** gpId → id */
  byGp: Record<string, string>;
};

type AuditFile = {
  updatedAt: string;
  entries: AuditEntry[];
};

type MeshKv = {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

let fsMemory: StoreFile | null = null;
let auditMemory: AuditFile | null = null;

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
  return { updatedAt: new Date().toISOString(), byId: {}, byGp: {} };
}

function emptyAudit(): AuditFile {
  return { updatedAt: new Date().toISOString(), entries: [] };
}

function complianceKey(): string | null {
  const k = process.env.GRID_COMPLIANCE_KEY ?? "";
  if (k.length < 16) return null;
  return k;
}

function utf8(s: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(s) as Uint8Array<ArrayBuffer>;
}

function asBufferSource(u: Uint8Array): BufferSource {
  return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;
}

async function aesKey(secret: string): Promise<CryptoKey> {
  // Derive 256-bit key via SHA-256 of secret
  const hash = await crypto.subtle.digest("SHA-256", utf8(secret));
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function sealPlain(
  plain: CompliancePlain,
): Promise<string | null> {
  const secret = complianceKey();
  if (!secret) return null;
  const key = await aesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    utf8(JSON.stringify(plain)),
  );
  const packed = new Uint8Array(iv.length + new Uint8Array(ct).length);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ct), iv.length);
  return btoa(String.fromCharCode(...packed));
}

export async function unsealPlain(
  sealed: string,
): Promise<CompliancePlain | null> {
  const secret = complianceKey();
  if (!secret) return null;
  try {
    const raw = Uint8Array.from(atob(sealed), (c) => c.charCodeAt(0));
    if (raw.length < 13) return null;
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);
    const key = await aesKey(secret);
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: asBufferSource(iv) },
      key,
      asBufferSource(data),
    );
    const obj = JSON.parse(new TextDecoder().decode(pt)) as CompliancePlain;
    if (typeof obj.ip !== "string" || typeof obj.mac !== "string") return null;
    return {
      ip: obj.ip.slice(0, 64),
      mac: obj.mac.slice(0, 64),
    };
  } catch {
    return null;
  }
}

export function complianceConfigured(): boolean {
  return complianceKey() != null;
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
    const p = path.join(process.cwd(), "data", "gp-compliance.json");
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
  for (const r of Object.values(parsed.byId ?? {})) {
    const s = scrubRow(r);
    if (s) {
      store.byId[s.id] = s;
      store.byGp[s.gpId] = s.id;
    }
  }
  store.updatedAt =
    typeof parsed.updatedAt === "string"
      ? parsed.updatedAt.slice(0, 40)
      : store.updatedAt;
  return store;
}

function scrubRow(r: ComplianceRow): ComplianceRow | null {
  if (!isValidGpIdHex(r.gpId)) return null;
  const realm = normalizeRealm(r.realm);
  if (!realm) return null;
  const nodeId = sanitizeNodeId(r.nodeId) ?? "node_unknown";
  return {
    id: String(r.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48),
    gpId: r.gpId,
    realm,
    nodeId,
    machineRef: sanitizeLabel(r.machineRef, "mach", 48),
    sealed: String(r.sealed ?? "").slice(0, 4096),
    consentVersion: String(r.consentVersion ?? "").slice(0, 40),
    collectedAt: String(r.collectedAt ?? "").slice(0, 40),
    updatedAt: String(r.updatedAt ?? "").slice(0, 40),
    bodyHash: r.bodyHash ? String(r.bodyHash).slice(0, 128) : undefined,
    signature: r.signature ? String(r.signature).slice(0, 256) : undefined,
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
    const p = path.join(process.cwd(), "data", "gp-compliance.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(store, null, 2), "utf8");
  } catch {
    /* ephemeral */
  }
}

async function loadAudit(): Promise<{ audit: AuditFile; kv: MeshKv | null }> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(AUDIT_KEY, "text");
    if (raw) {
      try {
        return { audit: JSON.parse(raw) as AuditFile, kv };
      } catch {
        /* fallthrough */
      }
    }
    return { audit: emptyAudit(), kv };
  }
  if (auditMemory) return { audit: auditMemory, kv: null };
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "gp-compliance-audit.json");
    const raw = await fs.readFile(p, "utf8");
    auditMemory = JSON.parse(raw) as AuditFile;
    return { audit: auditMemory, kv: null };
  } catch {
    auditMemory = emptyAudit();
    return { audit: auditMemory, kv: null };
  }
}

async function saveAudit(audit: AuditFile, kv: MeshKv | null): Promise<void> {
  audit.updatedAt = new Date().toISOString();
  if (audit.entries.length > MAX_AUDIT) {
    audit.entries = audit.entries.slice(-MAX_AUDIT);
  }
  const payload = JSON.stringify(audit);
  if (kv) {
    await kv.put(AUDIT_KEY, payload);
    return;
  }
  auditMemory = audit;
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "gp-compliance-audit.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(audit, null, 2), "utf8");
  } catch {
    /* ephemeral */
  }
}

export async function appendAudit(entry: Omit<AuditEntry, "at">): Promise<void> {
  const { audit, kv } = await loadAudit();
  audit.entries.push({ ...entry, at: new Date().toISOString() });
  await saveAudit(audit, kv);
}

export async function listAudit(limit = 100): Promise<AuditEntry[]> {
  const { audit } = await loadAudit();
  return audit.entries.slice(-limit).reverse();
}

export class ComplianceError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function makeId(): string {
  return `cmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Ingest signed attestation from node (operator consented). */
export async function upsertAttestation(input: {
  gpId: string;
  realm: string;
  nodeId: string;
  machineRef: string;
  ip: string;
  mac: string;
  consentVersion: string;
  collectedAt?: string;
  bodyHash?: string;
  signature?: string;
}): Promise<ComplianceRow> {
  if (!isValidGpIdHex(input.gpId)) {
    throw new ComplianceError(400, "invalid gpId");
  }
  const realm = normalizeRealm(input.realm);
  if (!realm) throw new ComplianceError(400, "invalid realm");
  if (!complianceConfigured()) {
    throw new ComplianceError(
      503,
      "Compliance vault not configured (GRID_COMPLIANCE_KEY)",
    );
  }

  const ip = String(input.ip ?? "")
    .trim()
    .slice(0, 64);
  const mac = String(input.mac ?? "")
    .trim()
    .slice(0, 64);
  if (!ip || !mac) throw new ComplianceError(400, "ip and mac required");

  // Crude IP shape check (v4 or v6-ish) — not for auth
  if (!/^[\d.:a-fA-F%]+$/.test(ip)) {
    throw new ComplianceError(400, "invalid ip format");
  }

  const sealed = await sealPlain({ ip, mac });
  if (!sealed) throw new ComplianceError(500, "encrypt failed");

  const { store, kv } = await loadStore();
  const now = new Date().toISOString();
  const existingId = store.byGp[input.gpId];
  const id = existingId ?? makeId();
  const row: ComplianceRow = {
    id,
    gpId: input.gpId,
    realm,
    nodeId: sanitizeNodeId(input.nodeId) ?? "node_unknown",
    machineRef: sanitizeLabel(input.machineRef, "mach", 48),
    sealed,
    consentVersion: String(input.consentVersion).slice(0, 40),
    collectedAt: (input.collectedAt ?? now).slice(0, 40),
    updatedAt: now,
    bodyHash: input.bodyHash?.slice(0, 128),
    signature: input.signature?.slice(0, 256),
  };
  store.byId[id] = row;
  store.byGp[input.gpId] = id;

  // Cap store
  const ids = Object.keys(store.byId);
  if (ids.length > MAX_ROWS) {
    const sorted = ids
      .map((i) => store.byId[i]!)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    for (const drop of sorted.slice(0, ids.length - MAX_ROWS)) {
      delete store.byId[drop.id];
      delete store.byGp[drop.gpId];
    }
  }

  await saveStore(store, kv);
  await appendAudit({
    action: "attest_upsert",
    gpId: row.gpId,
    realm: row.realm,
    actor: "node",
    detail: "encrypted",
  });
  return row;
}

export type AdminComplianceListItem = {
  id: string;
  gpId: string;
  realm: string;
  gridUrl: string;
  nodeId: string;
  machineRef: string;
  consentVersion: string;
  collectedAt: string;
  updatedAt: string;
  /** Present only when decrypt=true and step-up ok */
  ip?: string;
  mac?: string;
};

export async function listForAdmin(opts: {
  page?: number;
  pageSize?: number;
  decrypt?: boolean;
}): Promise<{
  total: number;
  page: number;
  pageSize: number;
  rows: AdminComplianceListItem[];
  complianceConfigured: boolean;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25));
  const { store } = await loadStore();
  const all = Object.values(store.byId).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const total = all.length;
  const slice = all.slice((page - 1) * pageSize, page * pageSize);
  const rows: AdminComplianceListItem[] = [];
  for (const r of slice) {
    const item: AdminComplianceListItem = {
      id: r.id,
      gpId: r.gpId,
      realm: r.realm,
      gridUrl: `grid://${r.realm}.grid`,
      nodeId: r.nodeId,
      machineRef: r.machineRef,
      consentVersion: r.consentVersion,
      collectedAt: r.collectedAt,
      updatedAt: r.updatedAt,
    };
    if (opts.decrypt) {
      const plain = await unsealPlain(r.sealed);
      if (plain) {
        item.ip = plain.ip;
        item.mac = plain.mac;
      }
    }
    rows.push(item);
  }
  return {
    total,
    page,
    pageSize,
    rows,
    complianceConfigured: complianceConfigured(),
  };
}
