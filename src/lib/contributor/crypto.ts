import { ContributorError } from "./db";

const encoder = new TextEncoder();
// Cloudflare Workers currently caps a single PBKDF2 operation at 100,000
// iterations. Keep the count encoded with each hash for future migrations.
const PASSWORD_ITERATIONS = 100_000;

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
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function randomToken(bytes = 32): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256(value: string): Promise<string> {
  return bytesToBase64Url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 128) {
    throw new ContributorError(400, "Password must be 12–128 characters");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PASSWORD_ITERATIONS },
    material,
    256,
  );
  return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, iterationsRaw, saltRaw, expectedRaw] = encoded.split("$");
  const iterations = Number(iterationsRaw);
  if (
    algorithm !== "pbkdf2-sha256" ||
    !Number.isSafeInteger(iterations) ||
    iterations < 100_000 ||
    iterations > PASSWORD_ITERATIONS ||
    !saltRaw ||
    !expectedRaw
  ) return false;
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const actual = new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: base64UrlToBytes(saltRaw),
        iterations,
      },
      material,
      256,
    ),
  );
  const expected = base64UrlToBytes(expectedRaw);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index++) {
    difference |= actual[index]! ^ expected[index]!;
  }
  return difference === 0;
}

async function encryptionKey(): Promise<CryptoKey> {
  const secret = process.env.CONTRIBUTOR_ENCRYPTION_KEY?.trim();
  if (!secret || secret.length < 32) {
    throw new ContributorError(503, "Contributor encryption key is not configured");
  }
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptSecret(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    encoder.encode(plaintext),
  );
  return `${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(ciphertext))}`;
}

export async function decryptSecret(encoded: string): Promise<string> {
  const [iv, ciphertext] = encoded.split(".");
  if (!iv || !ciphertext) throw new ContributorError(500, "Invalid encrypted secret");
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(iv) },
    await encryptionKey(),
    base64UrlToBytes(ciphertext),
  );
  return new TextDecoder().decode(plaintext);
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newTotpSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let output = "";
  let bits = 0;
  let value = 0;
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
}

function decodeBase32(input: string): Uint8Array<ArrayBuffer> {
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const character of input.replace(/=+$/, "").toUpperCase()) {
    const index = BASE32.indexOf(character);
    if (index < 0) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  const bytes = new Uint8Array(output.length);
  bytes.set(output);
  return bytes;
}

async function totpAt(secret: string, counter: number): Promise<string> {
  const counterBytes = new Uint8Array(8);
  new DataView(counterBytes.buffer).setBigUint64(0, BigInt(counter));
  const key = await crypto.subtle.importKey(
    "raw",
    decodeBase32(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, counterBytes));
  const offset = signature[signature.length - 1]! & 15;
  const value =
    ((signature[offset]! & 127) << 24) |
    ((signature[offset + 1]! & 255) << 16) |
    ((signature[offset + 2]! & 255) << 8) |
    (signature[offset + 3]! & 255);
  return String(value % 1_000_000).padStart(6, "0");
}

export async function verifyTotp(secret: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(Date.now() / 30_000);
  for (let drift = -1; drift <= 1; drift++) {
    if ((await totpAt(secret, counter + drift)) === code) return true;
  }
  return false;
}
