/**
 * Admin session auth — HMAC-signed HttpOnly cookie.
 *
 * Secret: GRID_ADMIN_SECRET (wrangler secret put GRID_ADMIN_SECRET)
 * Never commit the secret. Login is rate-limited in-memory per isolate.
 */

const COOKIE = "grid_admin_sess";
const SESSION_TTL_SEC = 8 * 3600; // 8 hours
const MAX_LOGIN_ATTEMPTS = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

type Attempt = { count: number; first: number };
const loginAttempts = new Map<string, Attempt>();

function envStr(key: string, fallback = ""): string {
  try {
    const v = process.env[key];
    if (v != null && String(v).length > 0) return String(v);
  } catch {
    /* ignore */
  }
  return fallback;
}

export function adminSecretConfigured(): boolean {
  return envStr("GRID_ADMIN_SECRET").length >= 16;
}

export function getAdminSecret(): string | null {
  const s = envStr("GRID_ADMIN_SECRET");
  if (s.length < 16) return null;
  return s;
}

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i]! ^ bb[i]!;
  return diff === 0;
}

function clientKey(req: Request): string {
  // Cloudflare may set CF-Connecting-IP; never trust alone for auth, only rate limit.
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function checkLoginRateLimit(req: Request): {
  ok: boolean;
  retryAfterSec?: number;
} {
  const key = clientKey(req);
  const now = Date.now();
  const a = loginAttempts.get(key);
  if (!a) return { ok: true };
  if (now - a.first > LOCKOUT_MS) {
    loginAttempts.delete(key);
    return { ok: true };
  }
  if (a.count >= MAX_LOGIN_ATTEMPTS) {
    const retryAfterSec = Math.ceil((LOCKOUT_MS - (now - a.first)) / 1000);
    return { ok: false, retryAfterSec };
  }
  return { ok: true };
}

export function recordLoginFailure(req: Request): void {
  const key = clientKey(req);
  const now = Date.now();
  const a = loginAttempts.get(key);
  if (!a || now - a.first > LOCKOUT_MS) {
    loginAttempts.set(key, { count: 1, first: now });
    return;
  }
  a.count += 1;
}

export function clearLoginFailures(req: Request): void {
  loginAttempts.delete(clientKey(req));
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
  return bufferToBase64Url(sig);
}

async function hmacVerify(
  secret: string,
  message: string,
  signature: string,
): Promise<boolean> {
  const expected = await hmacSign(secret, message);
  return timingSafeEqualString(expected, signature);
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToString(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return atob(b64);
}

function stringToBase64Url(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Create signed session token: base64url(exp).sig */
export async function createSessionToken(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const payload = `${exp}.${nonce}`;
  const body = stringToBase64Url(payload);
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(
  secret: string,
  token: string,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  if (!body || !sig) return false;
  if (!(await hmacVerify(secret, body, sig))) return false;
  try {
    const payload = base64UrlToString(body);
    const exp = Number(payload.split(".")[0]);
    if (!Number.isFinite(exp)) return false;
    if (Math.floor(Date.now() / 1000) > exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function sessionCookieHeader(token: string, maxAge = SESSION_TTL_SEC): string {
  const secure =
    envStr("NODE_ENV") === "production" || envStr("CF_PAGES") === "1"
      ? "; Secure"
      : "";
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookieHeader(): string {
  const secure =
    envStr("NODE_ENV") === "production" ? "; Secure" : "";
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function readSessionCookie(req: Request): string | null {
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

/**
 * Authenticate admin request via:
 * 1. Session cookie (preferred for dashboard)
 * 2. Authorization: Bearer <GRID_ADMIN_SECRET>
 * 3. X-Grid-Admin-Secret header
 */
export async function requireAdmin(
  req: Request,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const secret = getAdminSecret();
  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: "Admin not configured (set GRID_ADMIN_SECRET, min 16 chars)",
    };
  }

  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = (req.headers.get("x-grid-admin-secret") ?? "").trim();
  if (bearer && timingSafeEqualString(bearer, secret)) return { ok: true };
  if (header && timingSafeEqualString(header, secret)) return { ok: true };

  const cookie = readSessionCookie(req);
  if (cookie && (await verifySessionToken(secret, cookie))) return { ok: true };

  return { ok: false, status: 401, error: "unauthorized" };
}

export { COOKIE as ADMIN_COOKIE, SESSION_TTL_SEC };
