export const HEARTBEAT_VERSION = 1 as const;
export const HEARTBEAT_DOMAIN = "GRID-MESH-HEARTBEAT-V1";
export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
export const MAX_BODY_BYTES = 4_096;

const HEX_32 = /^[0-9a-f]{64}$/;
const HEX_64 = /^[0-9a-f]{128}$/;
const NONCE = /^[0-9a-f]{32}$/;
const LABEL = /^[A-Za-z0-9][A-Za-z0-9 _.'-]{0,31}$/;
const REGION = /^[A-Z0-9][A-Z0-9_-]{0,15}$/;
const ALLOWED_KEYS = new Set([
  "version",
  "publicKey",
  "issuedAtMs",
  "nonce",
  "label",
  "class",
  "region",
  "status",
  "latE4",
  "lngE4",
  "signature",
]);

export type HeartbeatClass = "S" | "M" | "L";
export type HeartbeatStatus = "online" | "syncing" | "idle" | "offline";

export interface SignedHeartbeatV1 {
  version: typeof HEARTBEAT_VERSION;
  publicKey: string;
  issuedAtMs: number;
  nonce: string;
  label: string;
  class: HeartbeatClass;
  region: string;
  status: HeartbeatStatus;
  latE4: number;
  lngE4: number;
  signature: string;
}

export class HeartbeatError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSafeLabel(value: unknown): value is string {
  if (typeof value !== "string" || !LABEL.test(value)) return false;
  if (/(?:\d{1,3}\.){3}\d{1,3}|:\/\/|:\d{2,5}\b/.test(value)) return false;
  return true;
}

export function parseHeartbeat(value: unknown): SignedHeartbeatV1 {
  if (!isRecord(value)) {
    throw new HeartbeatError(400, "body must be a JSON object");
  }
  for (const key of Object.keys(value)) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new HeartbeatError(400, `unsupported field: ${key}`);
    }
  }
  if (value.version !== HEARTBEAT_VERSION) {
    throw new HeartbeatError(400, "unsupported heartbeat version");
  }
  if (typeof value.publicKey !== "string" || !HEX_32.test(value.publicKey)) {
    throw new HeartbeatError(400, "publicKey must be 32-byte lowercase hex");
  }
  if (
    !Number.isSafeInteger(value.issuedAtMs) ||
    Number(value.issuedAtMs) <= 0
  ) {
    throw new HeartbeatError(400, "issuedAtMs must be a positive integer");
  }
  if (typeof value.nonce !== "string" || !NONCE.test(value.nonce)) {
    throw new HeartbeatError(400, "nonce must be 16-byte lowercase hex");
  }
  if (!isSafeLabel(value.label)) {
    throw new HeartbeatError(400, "invalid label");
  }
  if (value.class !== "S" && value.class !== "M" && value.class !== "L") {
    throw new HeartbeatError(400, "class must be S, M, or L");
  }
  if (typeof value.region !== "string" || !REGION.test(value.region)) {
    throw new HeartbeatError(400, "invalid region");
  }
  if (
    value.status !== "online" &&
    value.status !== "syncing" &&
    value.status !== "idle" &&
    value.status !== "offline"
  ) {
    throw new HeartbeatError(400, "invalid status");
  }
  if (
    !Number.isSafeInteger(value.latE4) ||
    Number(value.latE4) < -900_000 ||
    Number(value.latE4) > 900_000
  ) {
    throw new HeartbeatError(400, "latE4 out of range");
  }
  if (
    !Number.isSafeInteger(value.lngE4) ||
    Number(value.lngE4) < -1_800_000 ||
    Number(value.lngE4) > 1_800_000
  ) {
    throw new HeartbeatError(400, "lngE4 out of range");
  }
  if (typeof value.signature !== "string" || !HEX_64.test(value.signature)) {
    throw new HeartbeatError(400, "signature must be 64-byte lowercase hex");
  }
  return value as unknown as SignedHeartbeatV1;
}

export function canonicalHeartbeat(body: SignedHeartbeatV1): Uint8Array {
  const message = [
    HEARTBEAT_DOMAIN,
    `publicKey=${body.publicKey}`,
    `issuedAtMs=${body.issuedAtMs}`,
    `nonce=${body.nonce}`,
    `label=${body.label}`,
    `class=${body.class}`,
    `region=${body.region}`,
    `status=${body.status}`,
    `latE4=${body.latE4}`,
    `lngE4=${body.lngE4}`,
  ].join("\n");
  return new TextEncoder().encode(message);
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function nodeIdForPublicKey(publicKey: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    asArrayBuffer(hexToBytes(publicKey)),
  );
  return `node_${bytesToHex(new Uint8Array(digest)).slice(0, 48)}`;
}

export async function verifyHeartbeatSignature(
  body: SignedHeartbeatV1,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    asArrayBuffer(hexToBytes(body.publicKey)),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    { name: "Ed25519" },
    key,
    asArrayBuffer(hexToBytes(body.signature)),
    asArrayBuffer(canonicalHeartbeat(body)),
  );
}

export function assertFresh(
  body: SignedHeartbeatV1,
  nowMs = Date.now(),
): void {
  if (Math.abs(nowMs - body.issuedAtMs) > MAX_CLOCK_SKEW_MS) {
    throw new HeartbeatError(401, "heartbeat timestamp outside allowed window");
  }
}
