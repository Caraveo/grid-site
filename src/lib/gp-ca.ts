/**
 * Registry CA — Ed25519 permanent certs for Key / Verified Entity.
 *
 * Env:
 *   GRID_CA_SEED — 64 hex chars (32-byte seed) preferred
 *   or GRID_CA_SECRET_KEY — 128 hex (tweetnacl 64-byte secret key)
 *
 * Public key is derived and exposed via GET /api/registry/entity?ca=1
 */

import nacl from "tweetnacl";
import type { CertTier } from "./gp-id";
import type { EntityApplication } from "./entity-store";

export type GpCertificate = {
  version: number;
  gpId: string;
  realm: string;
  pubkeyHex: string;
  tier: CertTier;
  entityName?: string;
  issuedAt: string;
  notAfter: string;
  caSignature: string;
  paymentRef?: string;
  caPubkeyHex: string;
};

const VERSION = 1;
/** ~100 years — product: permanent; revoke via admin */
const NOT_AFTER_YEARS = 100;

function envStr(key: string): string {
  try {
    const v = process.env[key];
    if (v != null && String(v).length > 0) return String(v).trim();
  } catch {
    /* ignore */
  }
  return "";
}

function hexToBytes(hex: string): Uint8Array | null {
  const h = hex.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]+$/.test(h) || h.length % 2 !== 0) return null;
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function caConfigured(): boolean {
  return getCaKeyPair() != null;
}

function getCaKeyPair(): nacl.SignKeyPair | null {
  const seedHex = envStr("GRID_CA_SEED");
  if (seedHex.length === 64) {
    const seed = hexToBytes(seedHex);
    if (seed && seed.length === 32) {
      return nacl.sign.keyPair.fromSeed(seed);
    }
  }
  const skHex = envStr("GRID_CA_SECRET_KEY");
  if (skHex.length === 128) {
    const sk = hexToBytes(skHex);
    if (sk && sk.length === 64) {
      return nacl.sign.keyPair.fromSecretKey(sk);
    }
  }
  return null;
}

export function caPubkeyHex(): string | null {
  const kp = getCaKeyPair();
  if (!kp) return null;
  return bytesToHex(kp.publicKey);
}

/** Canonical body — must match GProc / CLI verify. */
export function certCanonicalBody(c: {
  version: number;
  gpId: string;
  realm: string;
  pubkeyHex: string;
  tier: CertTier;
  entityName?: string;
  issuedAt: string;
  notAfter: string;
  paymentRef?: string;
}): string {
  const entity = c.entityName ?? "";
  const pay = c.paymentRef ?? "";
  return [
    `GRID-GP-CERT-v${c.version}`,
    c.gpId,
    c.realm,
    c.pubkeyHex.toLowerCase(),
    c.tier,
    entity,
    c.issuedAt,
    c.notAfter,
    pay,
  ].join("\n");
}

function farNotAfter(from: Date): string {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + NOT_AFTER_YEARS);
  return d.toISOString();
}

export function issueCertificate(app: EntityApplication): GpCertificate {
  const kp = getCaKeyPair();
  if (!kp) {
    throw new Error(
      "CA not configured — set GRID_CA_SEED (64 hex) or GRID_CA_SECRET_KEY (128 hex)",
    );
  }
  const issuedAt = new Date().toISOString();
  const draft = {
    version: VERSION,
    gpId: app.gpId,
    realm: app.realm,
    pubkeyHex: app.pubkeyHex.toLowerCase(),
    tier: app.tier,
    entityName: app.entityName,
    issuedAt,
    notAfter: farNotAfter(new Date(issuedAt)),
    paymentRef: app.id,
  };
  const body = certCanonicalBody(draft);
  const msg = new TextEncoder().encode(body);
  const sig = nacl.sign.detached(msg, kp.secretKey);
  return {
    ...draft,
    caSignature: bytesToHex(sig),
    caPubkeyHex: bytesToHex(kp.publicKey),
  };
}

export function verifyCertificate(cert: GpCertificate): boolean {
  const pkHex = cert.caPubkeyHex || caPubkeyHex();
  if (!pkHex) return false;
  const pk = hexToBytes(pkHex);
  const sig = hexToBytes(cert.caSignature);
  if (!pk || pk.length !== 32 || !sig || sig.length !== 64) return false;
  const body = certCanonicalBody(cert);
  const msg = new TextEncoder().encode(body);
  try {
    if (!nacl.sign.detached.verify(msg, sig, pk)) return false;
  } catch {
    return false;
  }
  // notAfter check
  const exp = Date.parse(cert.notAfter);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return true;
}
