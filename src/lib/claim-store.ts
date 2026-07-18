/**
 * Signed realm claims from `grid claim <name>`.
 * Verifies Ed25519 operator signatures (tweetnacl) over blake3 bodyHash.
 * Safe fields only — no IPs/ports.
 */

import nacl from "tweetnacl";

const KV_KEY = "realm-claims-v1";
const MAX_CLAIMS = 10_000;

export type RealmClaimRecord = {
  name: string;
  realm: string;
  operatorPubkey: string;
  nodeId: string;
  nodeLabel: string;
  machineId: string;
  class: string;
  region: string;
  computes: string[];
  claimedAt: string;
  bodyHash: string;
  signature: string;
  auth?: { mode?: string; passkey?: boolean; sessionStepUp?: boolean };
  receivedAt: string;
};

type StoreFile = {
  updatedAt: string;
  byName: Record<string, RealmClaimRecord>;
};

type MeshKv = {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

let fsMemory: StoreFile | null = null;

export class ClaimError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

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
  return { updatedAt: new Date().toISOString(), byName: {} };
}

async function loadStore(): Promise<{ store: StoreFile; kv: MeshKv | null }> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(KV_KEY, "text");
    if (raw) {
      try {
        return { store: JSON.parse(raw) as StoreFile, kv };
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
    const p = path.join(process.cwd(), "data", "claims.json");
    const raw = await fs.readFile(p, "utf8");
    fsMemory = JSON.parse(raw) as StoreFile;
    return { store: fsMemory, kv: null };
  } catch {
    return { store: emptyStore(), kv: null };
  }
}

async function saveStore(store: StoreFile, kv: MeshKv | null): Promise<void> {
  store.updatedAt = new Date().toISOString();
  fsMemory = store;
  if (kv) {
    await kv.put(KV_KEY, JSON.stringify(store));
    return;
  }
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "claims.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(store, null, 2), "utf8");
  } catch {
    /* ephemeral */
  }
}

function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
  if (s.length < 2) return null;
  return s;
}

function hexToBytes(hex: string): Uint8Array | null {
  const h = hex.trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(h) || h.length % 2 !== 0) return null;
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** CLI signs bodyHash UTF-8 bytes with Ed25519 operator key. */
function verifyOperatorSig(
  pubkeyHex: string,
  bodyHash: string,
  signatureHex: string,
): boolean {
  const pk = hexToBytes(pubkeyHex);
  const sig = hexToBytes(signatureHex);
  if (!pk || pk.length !== 32 || !sig || sig.length !== 64) return false;
  if (!/^[0-9a-f]{64}$/i.test(bodyHash.trim())) return false;
  const msg = new TextEncoder().encode(bodyHash.trim());
  try {
    return nacl.sign.detached.verify(msg, sig, pk);
  } catch {
    return false;
  }
}

export async function acceptRealmClaim(
  body: Record<string, unknown>,
): Promise<RealmClaimRecord> {
  const name = sanitizeName(body.name);
  if (!name) throw new ClaimError(400, "invalid name");

  const operatorPubkey = String(body.operatorPubkey ?? body.operator_pubkey ?? "")
    .trim()
    .toLowerCase();
  const bodyHash = String(body.bodyHash ?? body.body_hash ?? "")
    .trim()
    .toLowerCase();
  const signature = String(body.signature ?? "")
    .trim()
    .toLowerCase();

  if (!/^[0-9a-f]{64}$/.test(operatorPubkey)) {
    throw new ClaimError(400, "operatorPubkey must be 32-byte hex");
  }
  if (!/^[0-9a-f]{64}$/.test(bodyHash)) {
    throw new ClaimError(400, "bodyHash must be 32-byte blake3 hex");
  }
  if (!/^[0-9a-f]{128}$/.test(signature)) {
    throw new ClaimError(400, "signature must be 64-byte Ed25519 hex");
  }

  if (!verifyOperatorSig(operatorPubkey, bodyHash, signature)) {
    throw new ClaimError(401, "invalid operator signature");
  }

  // Paid activation required — Cash App $Caraveo ($5) + admin approve.
  // Prevents abuse; review work creates employment.
  const { getActiveRegistration } = await import("./registration-store");
  const reg = await getActiveRegistration(name);
  if (!reg) {
    throw new ClaimError(
      402,
      `Realm «${name}» is not activated on registry.grid. Pay $5 via Cash App to $Caraveo with your registration note, confirm, and wait for approve. Donations accepted at $Caraveo.`,
    );
  }

  const nodeId = String(body.nodeId ?? body.node_id ?? "")
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, 64);
  if (!nodeId) throw new ClaimError(400, "nodeId required");

  const { store, kv } = await loadStore();
  const existing = store.byName[name];
  if (existing && existing.operatorPubkey !== operatorPubkey) {
    throw new ClaimError(
      409,
      `Realm «${name}» already claimed by another operator`,
    );
  }

  const authRaw = body.auth;
  let auth: RealmClaimRecord["auth"];
  if (authRaw && typeof authRaw === "object" && !Array.isArray(authRaw)) {
    const a = authRaw as Record<string, unknown>;
    auth = {
      mode: a.mode != null ? String(a.mode).slice(0, 32) : undefined,
      passkey: Boolean(a.passkey),
      sessionStepUp: Boolean(a.sessionStepUp ?? a.session_step_up),
    };
  }

  const computes = Array.isArray(body.computes)
    ? body.computes
        .map((x) => String(x).toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32))
        .filter(Boolean)
        .slice(0, 32)
    : [];

  const record: RealmClaimRecord = {
    name,
    realm: `grid://${name}.grid`,
    operatorPubkey,
    nodeId,
    nodeLabel: String(body.nodeLabel ?? body.node_label ?? name).slice(0, 64),
    machineId: String(body.machineId ?? body.machine_id ?? "").slice(0, 64),
    class: String(body.class ?? "S")
      .toUpperCase()
      .slice(0, 1),
    region: String(body.region ?? "—").slice(0, 32),
    computes,
    claimedAt: String(body.claimedAt ?? body.claimed_at ?? new Date().toISOString()).slice(
      0,
      40,
    ),
    bodyHash,
    signature,
    auth,
    receivedAt: new Date().toISOString(),
  };

  store.byName[name] = record;

  // Cap
  const names = Object.keys(store.byName);
  if (names.length > MAX_CLAIMS) {
    const sorted = names
      .map((n) => store.byName[n])
      .sort((a, b) => Date.parse(a.receivedAt) - Date.parse(b.receivedAt));
    for (let i = 0; i < sorted.length - MAX_CLAIMS; i++) {
      delete store.byName[sorted[i].name];
    }
  }

  await saveStore(store, kv);
  return record;
}

export async function getRealmClaim(
  name: string,
): Promise<RealmClaimRecord | null> {
  const n = sanitizeName(name);
  if (!n) return null;
  const { store } = await loadStore();
  return store.byName[n] ?? null;
}

export async function listRealmClaims(): Promise<RealmClaimRecord[]> {
  const { store } = await loadStore();
  return Object.values(store.byName).sort((a, b) => a.name.localeCompare(b.name));
}
