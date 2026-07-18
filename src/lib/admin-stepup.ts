/**
 * Admin passkey step-up for compliance decrypt.
 *
 * MVP: time-boxed HMAC token issued after verifying GRID_ADMIN_STEPUP_SECRET
 * (or re-entry of admin secret + optional STEPUP code). Full WebAuthn can
 * replace the secret path later using existing passkey infra.
 *
 * Cookie: grid_admin_stepup — short TTL (15m).
 */

import {
  getAdminSecret,
  timingSafeEqualString,
} from "./admin-auth";

const COOKIE = "grid_admin_stepup";
const STEPUP_TTL_SEC = 15 * 60;

function envStr(key: string): string {
  try {
    const v = process.env[key];
    if (v != null && String(v).length > 0) return String(v);
  } catch {
    /* ignore */
  }
  return "";
}

/**
 * Step-up material: prefer GRID_ADMIN_STEPUP_SECRET (min 16), else same as
 * admin secret (weaker but works for solo ops).
 */
export function getStepupSecret(): string | null {
  const s = envStr("GRID_ADMIN_STEPUP_SECRET");
  if (s.length >= 16) return s;
  return getAdminSecret();
}

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  const bytes = new Uint8Array(sig);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function stringToBase64Url(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToString(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return atob(b64);
}

export async function createStepupToken(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + STEPUP_TTL_SEC;
  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const body = stringToBase64Url(`${exp}.${nonce}.forensics`);
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function verifyStepupToken(
  secret: string,
  token: string,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  if (!body || !sig) return false;
  const expected = await hmacSign(secret, body);
  if (!timingSafeEqualString(expected, sig)) return false;
  try {
    const payload = base64UrlToString(body);
    const exp = Number(payload.split(".")[0]);
    if (!Number.isFinite(exp)) return false;
    if (Math.floor(Date.now() / 1000) > exp) return false;
    return payload.endsWith(".forensics");
  } catch {
    return false;
  }
}

export function stepupCookieHeader(token: string): string {
  const secure =
    envStr("NODE_ENV") === "production" || envStr("CF_PAGES") === "1"
      ? "; Secure"
      : "";
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${STEPUP_TTL_SEC}${secure}`;
}

export function clearStepupCookieHeader(): string {
  const secure = envStr("NODE_ENV") === "production" ? "; Secure" : "";
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function readStepupCookie(req: Request): string | null {
  const raw = req.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE) {
      const v = rest.join("=").trim();
      return v || null;
    }
  }
  return null;
}

export async function requireStepup(
  req: Request,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const secret = getStepupSecret();
  if (!secret) {
    return { ok: false, status: 503, error: "Step-up not configured" };
  }
  const header = (req.headers.get("x-grid-admin-stepup") ?? "").trim();
  if (header) {
    if (await verifyStepupToken(secret, header)) return { ok: true };
    // also allow raw stepup secret for CLI
    if (timingSafeEqualString(header, secret)) return { ok: true };
  }
  const cookie = readStepupCookie(req);
  if (cookie && (await verifyStepupToken(secret, cookie))) return { ok: true };
  return {
    ok: false,
    status: 403,
    error: "forensics step-up required (POST /api/admin/stepup)",
  };
}

export { COOKIE as STEPUP_COOKIE, STEPUP_TTL_SEC };
