/**
 * IdentityKey (WebAuthn) for GRID public registration on grid-compute.com.
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticatorTransportFuture,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";

const CHALLENGE_KV = "passkey-challenges-v1";
const CRED_KV = "passkey-credentials-v1";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export function rpID(): string {
  return process.env.WEBAUTHN_RP_ID?.trim() || "grid-compute.com";
}

export function rpName(): string {
  return "GRID Registry";
}

export function expectedOrigins(): string[] {
  const extra = process.env.WEBAUTHN_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  return [
    "https://grid-compute.com",
    "https://www.grid-compute.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...extra,
  ];
}

type MeshKv = {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

async function getKv(): Promise<MeshKv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as { MESH_KV?: MeshKv }).MESH_KV ?? null;
  } catch {
    return null;
  }
}

// FS fallback for local dev
const memChallenges = new Map<string, { value: string; exp: number }>();
const memCreds = new Map<string, StoredCredential>();

export type StoredCredential = {
  credId: string;
  publicKey: string; // base64url
  counter: number;
  transports?: AuthenticatorTransportFuture[];
  regId?: string;
  name?: string;
  createdAt: string;
};

type CredStore = { byId: Record<string, StoredCredential> };

async function loadCreds(): Promise<{ store: CredStore; kv: MeshKv | null }> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(CRED_KV, "text");
    if (raw) {
      try {
        return { store: JSON.parse(raw) as CredStore, kv };
      } catch {
        /* empty */
      }
    }
    return { store: { byId: {} }, kv };
  }
  const byId: Record<string, StoredCredential> = {};
  for (const [k, v] of memCreds) byId[k] = v;
  return { store: { byId }, kv: null };
}

async function saveCreds(store: CredStore, kv: MeshKv | null): Promise<void> {
  if (kv) {
    await kv.put(CRED_KV, JSON.stringify(store));
    return;
  }
  memCreds.clear();
  for (const [k, v] of Object.entries(store.byId)) memCreds.set(k, v);
}

async function putChallenge(key: string, challenge: string): Promise<void> {
  const kv = await getKv();
  if (kv) {
    // Store under namespaced key with TTL when supported
    await kv.put(`${CHALLENGE_KV}:${key}`, challenge, {
      expirationTtl: Math.ceil(CHALLENGE_TTL_MS / 1000),
    });
    return;
  }
  memChallenges.set(key, { value: challenge, exp: Date.now() + CHALLENGE_TTL_MS });
}

async function takeChallenge(key: string): Promise<string | null> {
  const kv = await getKv();
  if (kv) {
    const full = `${CHALLENGE_KV}:${key}`;
    const v = await kv.get(full, "text");
    if (v) {
      // one-time use: overwrite empty with short TTL
      await kv.put(full, "", { expirationTtl: 1 });
    }
    return v;
  }
  const e = memChallenges.get(key);
  memChallenges.delete(key);
  if (!e || Date.now() > e.exp) return null;
  return e.value;
}

function b64urlToUint8(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function uint8ToB64url(buf: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createRegistrationOptions(input: {
  userId: string;
  userName: string;
  userDisplayName: string;
}): Promise<{ options: PublicKeyCredentialCreationOptionsJSON; challengeKey: string }> {
  const { store } = await loadCreds();
  const exclude = Object.values(store.byId)
    .filter((c) => c.name === input.userName || c.regId === input.userId)
    .map((c) => ({
      id: c.credId,
      transports: c.transports,
    }));

  const options = await generateRegistrationOptions({
    rpName: rpName(),
    rpID: rpID(),
    userName: input.userName,
    userDisplayName: input.userDisplayName,
    userID: new TextEncoder().encode(input.userId.slice(0, 64)),
    attestationType: "none",
    excludeCredentials: exclude,
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: [-7, -257],
  });

  const challengeKey = `reg:${input.userId}:${Date.now()}`;
  await putChallenge(challengeKey, options.challenge);
  return {
    options: options as unknown as PublicKeyCredentialCreationOptionsJSON,
    challengeKey,
  };
}

export async function verifyAndStoreRegistration(input: {
  challengeKey: string;
  response: RegistrationResponseJSON;
  regId?: string;
  name?: string;
}): Promise<{ credId: string }> {
  const expectedChallenge = await takeChallenge(input.challengeKey);
  if (!expectedChallenge) {
    throw new PasskeyError(400, "Challenge expired — try again");
  }

  const verification = await verifyRegistrationResponse({
    response: input.response,
    expectedChallenge,
    expectedOrigin: expectedOrigins(),
    expectedRPID: rpID(),
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new PasskeyError(400, "IdentityKey verification failed");
  }

  const { credential } = verification.registrationInfo;
  const credId = credential.id;
  const publicKey = uint8ToB64url(
    credential.publicKey instanceof Uint8Array
      ? credential.publicKey
      : new Uint8Array(credential.publicKey as ArrayBuffer),
  );

  const { store, kv } = await loadCreds();
  store.byId[credId] = {
    credId,
    publicKey,
    counter: credential.counter ?? 0,
    transports: (input.response.response.transports ??
      credential.transports) as AuthenticatorTransportFuture[] | undefined,
    regId: input.regId,
    name: input.name,
    createdAt: new Date().toISOString(),
  };
  // keep store bounded
  const ids = Object.keys(store.byId);
  if (ids.length > 10_000) {
    const drop = ids.slice(0, ids.length - 10_000);
    for (const d of drop) delete store.byId[d];
  }
  await saveCreds(store, kv);

  return { credId };
}

export async function createAuthenticationOptions(input?: {
  name?: string;
}): Promise<{ options: PublicKeyCredentialRequestOptionsJSON; challengeKey: string }> {
  const { store } = await loadCreds();
  let allow = Object.values(store.byId);
  if (input?.name) {
    allow = allow.filter((c) => c.name === input.name);
  }

  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: "preferred",
    allowCredentials: allow.map((c) => ({
      id: c.credId,
      transports: c.transports,
    })),
  });

  const challengeKey = `auth:${input?.name ?? "any"}:${Date.now()}`;
  await putChallenge(challengeKey, options.challenge);
  return {
    options: options as unknown as PublicKeyCredentialRequestOptionsJSON,
    challengeKey,
  };
}

export async function verifyAuthentication(input: {
  challengeKey: string;
  response: AuthenticationResponseJSON;
}): Promise<{ credId: string; regId?: string; name?: string }> {
  const expectedChallenge = await takeChallenge(input.challengeKey);
  if (!expectedChallenge) {
    throw new PasskeyError(400, "Challenge expired — try again");
  }

  const { store, kv } = await loadCreds();
  const credId = input.response.id;
  const stored = store.byId[credId];
  if (!stored) {
    throw new PasskeyError(404, "Unknown IdentityKey");
  }

  const pub = b64urlToUint8(stored.publicKey);
  const publicKey = new Uint8Array(pub);

  const verification = await verifyAuthenticationResponse({
    response: input.response,
    expectedChallenge,
    expectedOrigin: expectedOrigins(),
    expectedRPID: rpID(),
    credential: {
      id: stored.credId,
      publicKey,
      counter: stored.counter,
      transports: stored.transports,
    },
    requireUserVerification: false,
  });

  if (!verification.verified) {
    throw new PasskeyError(400, "IdentityKey authentication failed");
  }

  stored.counter = verification.authenticationInfo.newCounter;
  store.byId[credId] = stored;
  await saveCreds(store, kv);

  return { credId, regId: stored.regId, name: stored.name };
}

export class PasskeyError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Minimal JSON types for client options (avoid tight coupling)
export type PublicKeyCredentialCreationOptionsJSON = Record<string, unknown>;
export type PublicKeyCredentialRequestOptionsJSON = Record<string, unknown>;
