import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { contributorDb, ContributorError } from "./db";
import type { ContributorUser } from "./types";

const RP_ID = "grid-compute.com";
const CHALLENGE_TTL = 5 * 60_000;

type StoredPasskey = {
  credential_id: string;
  user_id: string;
  public_key: string;
  counter: number;
  transports: string | null;
  device_name: string;
  created_at: number;
  last_used_at: number | null;
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function expectedOrigin(request: Request): string {
  const origin = new URL(request.url).origin;
  const allowed = new Set([
    "https://grid-compute.com",
    "https://www.grid-compute.com",
    "https://mail.grid-compute.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);
  if (!allowed.has(origin)) throw new ContributorError(400, "Passkeys are unavailable on this origin");
  return origin;
}

async function storeChallenge(userId: string, kind: "registration" | "authentication", challenge: string) {
  const id = crypto.randomUUID();
  const now = Date.now();
  await (await contributorDb())
    .prepare(
      `INSERT INTO contributor_passkey_challenges
       (id, user_id, kind, challenge, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, kind, challenge, now + CHALLENGE_TTL, now)
    .run();
  return id;
}

async function consumeChallenge(
  id: string,
  userId: string,
  kind: "registration" | "authentication",
): Promise<string> {
  const db = await contributorDb();
  const challenge = await db
    .prepare(
      `SELECT challenge FROM contributor_passkey_challenges
       WHERE id = ? AND user_id = ? AND kind = ? AND used_at IS NULL AND expires_at > ?`,
    )
    .bind(id, userId, kind, Date.now())
    .first<{ challenge: string }>();
  if (!challenge) throw new ContributorError(400, "Passkey challenge expired. Try again.");
  await db
    .prepare("UPDATE contributor_passkey_challenges SET used_at = ? WHERE id = ? AND used_at IS NULL")
    .bind(Date.now(), id)
    .run();
  return challenge.challenge;
}

export async function registrationOptions(user: ContributorUser) {
  const db = await contributorDb();
  const existing = await db
    .prepare("SELECT credential_id, transports FROM contributor_passkeys WHERE user_id = ?")
    .bind(user.id)
    .all<{ credential_id: string; transports: string | null }>();
  const options = await generateRegistrationOptions({
    rpName: "GRID Mail",
    rpID: RP_ID,
    userID: new TextEncoder().encode(user.id),
    userName: user.mail_email ?? user.username,
    userDisplayName: user.username,
    attestationType: "none",
    excludeCredentials: (existing.results ?? []).map((credential) => ({
      id: credential.credential_id,
      transports: credential.transports
        ? JSON.parse(credential.transports) as AuthenticatorTransportFuture[]
        : undefined,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
    },
    supportedAlgorithmIDs: [-7, -257],
  });
  return { options, challengeId: await storeChallenge(user.id, "registration", options.challenge) };
}

export async function registerPasskey(input: {
  request: Request;
  user: ContributorUser;
  challengeId: string;
  response: RegistrationResponseJSON;
  deviceName: string;
}) {
  const expectedChallenge = await consumeChallenge(
    input.challengeId,
    input.user.id,
    "registration",
  );
  const verification = await verifyRegistrationResponse({
    response: input.response,
    expectedChallenge,
    expectedOrigin: expectedOrigin(input.request),
    expectedRPID: RP_ID,
    requireUserVerification: true,
  });
  if (!verification.verified || !verification.registrationInfo) {
    throw new ContributorError(400, "Passkey verification failed");
  }
  const { credential } = verification.registrationInfo;
  await (await contributorDb())
    .prepare(
      `INSERT INTO contributor_passkeys
       (credential_id, user_id, public_key, counter, transports, device_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      credential.id,
      input.user.id,
      bytesToBase64Url(
        credential.publicKey instanceof Uint8Array
          ? credential.publicKey
          : new Uint8Array(credential.publicKey as ArrayBuffer),
      ),
      credential.counter ?? 0,
      JSON.stringify(input.response.response.transports ?? credential.transports ?? []),
      input.deviceName.trim().slice(0, 80) || "Passkey",
      Date.now(),
    )
    .run();
  return credential.id;
}

export async function authenticationOptions(user: ContributorUser) {
  const credentials = await (await contributorDb())
    .prepare("SELECT credential_id, transports FROM contributor_passkeys WHERE user_id = ?")
    .bind(user.id)
    .all<{ credential_id: string; transports: string | null }>();
  if (!(credentials.results?.length)) {
    throw new ContributorError(404, "No passkey is registered for this account");
  }
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "required",
    allowCredentials: credentials.results.map((credential) => ({
      id: credential.credential_id,
      transports: credential.transports
        ? JSON.parse(credential.transports) as AuthenticatorTransportFuture[]
        : undefined,
    })),
  });
  return { options, challengeId: await storeChallenge(user.id, "authentication", options.challenge) };
}

export async function authenticatePasskey(input: {
  request: Request;
  user: ContributorUser;
  challengeId: string;
  response: AuthenticationResponseJSON;
}) {
  const expectedChallenge = await consumeChallenge(
    input.challengeId,
    input.user.id,
    "authentication",
  );
  const db = await contributorDb();
  const stored = await db
    .prepare("SELECT * FROM contributor_passkeys WHERE credential_id = ? AND user_id = ?")
    .bind(input.response.id, input.user.id)
    .first<StoredPasskey>();
  if (!stored) throw new ContributorError(404, "Passkey not recognized");
  const verification = await verifyAuthenticationResponse({
    response: input.response,
    expectedChallenge,
    expectedOrigin: expectedOrigin(input.request),
    expectedRPID: RP_ID,
    credential: {
      id: stored.credential_id,
      publicKey: base64UrlToBytes(stored.public_key),
      counter: stored.counter,
      transports: stored.transports
        ? JSON.parse(stored.transports) as AuthenticatorTransportFuture[]
        : undefined,
    },
    requireUserVerification: true,
  });
  if (!verification.verified) throw new ContributorError(401, "Passkey authentication failed");
  await db
    .prepare("UPDATE contributor_passkeys SET counter = ?, last_used_at = ? WHERE credential_id = ?")
    .bind(verification.authenticationInfo.newCounter, Date.now(), stored.credential_id)
    .run();
  return stored;
}

export async function listPasskeys(userId: string) {
  const result = await (await contributorDb())
    .prepare(
      `SELECT credential_id, device_name, created_at, last_used_at
       FROM contributor_passkeys WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .bind(userId)
    .all<Record<string, unknown>>();
  return result.results ?? [];
}
