/**
 * Strict input filters for the mesh webhook + public mesh output.
 * Allowlist-only — rejects XSS, HTML, script, control chars, IPs, and oversized junk.
 */

/** Strip C0/C1 controls, zero-width, bidi overrides, BOM */
const CONTROL =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;

/** Anything that looks like markup / script / event handlers */
const INJECTION =
  /[<>`\\]|javascript:|data:|vbscript:|on\w+\s*=|&#|%3c|%3e|%22|%27|&lt;|&gt;|&quot;|&#x/i;

/** Path / template / SQL-ish noise we never want in display names */
const HOSTILE = /[{}$]|\$\{|`|\|\||&&|--|\/\*|\*\/|;|\n|\r|\t/;

const IP_V4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const HAS_IP = /(?:\d{1,3}\.){3}\d{1,3}/;
const HAS_PORT = /:\d{2,5}\b/;

export type SafeTextKind = "id" | "label" | "region" | "class" | "status";

function stripControls(s: string): string {
  return s.replace(CONTROL, "");
}

function looksInjected(s: string): boolean {
  if (INJECTION.test(s)) return true;
  if (HOSTILE.test(s)) return true;
  // angle / quote spam
  if ((s.match(/["']/g) ?? []).length > 2) return true;
  return false;
}

function looksLikeNetwork(s: string): boolean {
  const t = s.trim();
  if (IP_V4.test(t) || HAS_IP.test(t)) return true;
  if (HAS_PORT.test(t)) return true;
  if (t.includes("://")) return true;
  if (/@/.test(t) && t.includes(".")) return true; // email-ish
  return false;
}

/**
 * nodeId / fingerprint — alphanumeric + _ - only
 * @param opts.allowGenesis — permit the reserved genesis id (store load only)
 */
export function sanitizeNodeId(
  raw: unknown,
  max = 64,
  opts?: { allowGenesis?: boolean },
): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const s = stripControls(String(raw)).trim();
  if (!s || s.length > max) return null;
  const cleaned = s.replace(/[^a-zA-Z0-9_-]/g, "");
  if (cleaned.length < 2 || cleaned.length > max) return null;
  if (cleaned.toLowerCase() === "genesis") {
    return opts?.allowGenesis ? "genesis" : null; // reserved for peers
  }
  if (looksLikeNetwork(cleaned)) return null;
  return cleaned;
}

/**
 * Human name / label — letters, numbers, space, limited punctuation.
 * Displayed on globe + table → must be injection-safe.
 */
export function sanitizeLabel(raw: unknown, fallback: string, max = 32): string {
  if (raw == null) return fallback;
  let s = stripControls(String(raw)).normalize("NFKC").trim();
  if (!s) return fallback;
  if (s.length > max) s = s.slice(0, max);
  if (looksInjected(s) || looksLikeNetwork(s)) return fallback;

  // Allowlist: latin letters, numbers, space, hyphen, underscore, period, apostrophe
  s = s.replace(/[^a-zA-Z0-9 _.\-']/g, "");
  s = s.replace(/\s+/g, " ").trim();
  if (s.length < 1 || s.length > max) return fallback;

  // No pure punctuation / dots-only
  if (!/[a-zA-Z0-9]/.test(s)) return fallback;

  return s;
}

/**
 * Coarse region tag e.g. NA-W, EU, APAC, Origin
 */
export function sanitizeRegion(raw: unknown, max = 16): string {
  if (raw == null) return "—";
  let s = stripControls(String(raw)).normalize("NFKC").trim().toUpperCase();
  if (!s) return "—";
  if (s.length > max) s = s.slice(0, max);
  if (looksInjected(s) || looksLikeNetwork(s)) return "—";

  s = s.replace(/[^A-Z0-9_\-]/g, "");
  if (s.length < 1 || s.length > max) return "—";
  if (!/[A-Z0-9]/.test(s)) return "—";
  return s;
}

/** S | M | L only */
export function sanitizeClass(raw: unknown): "S" | "M" | "L" {
  const u = stripControls(String(raw ?? "S"))
    .trim()
    .toUpperCase()
    .slice(0, 1);
  if (u === "S" || u === "M" || u === "L") return u;
  return "S";
}

/** status / signal enum only */
export function sanitizeStatus(
  raw: unknown,
): "online" | "syncing" | "idle" | "offline" {
  const s = stripControls(String(raw ?? "online"))
    .trim()
    .toLowerCase()
    .slice(0, 16);
  if (s === "online" || s === "syncing" || s === "idle" || s === "offline") {
    return s;
  }
  return "online";
}

/** Finite lat/lng only; rejects NaN, Infinity, strings with junk */
export function sanitizeLatLng(
  latRaw: unknown,
  lngRaw: unknown,
): { lat: number; lng: number } | null {
  if (typeof latRaw === "string" && /[^\d.\-+eE]/.test(latRaw.trim())) {
    return null;
  }
  if (typeof lngRaw === "string" && /[^\d.\-+eE]/.test(lngRaw.trim())) {
    return null;
  }
  const lat = typeof latRaw === "number" ? latRaw : Number(latRaw);
  const lng = typeof lngRaw === "number" ? lngRaw : Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  // Reject absurd precision bombs (still finite but huge digit strings already Number-truncated)
  return { lat, lng };
}

/** Only known ping body keys may remain after filter */
export const ALLOWED_PING_KEYS = new Set([
  "nodeId",
  "id",
  "label",
  "name", // alias → label
  "class",
  "region",
  "status",
  "signal", // alias → status
  "lat",
  "lng",
  "longitude",
  "latitude",
]);

const BANNED_KEY_SUBSTR = [
  "ip",
  "host",
  "addr",
  "port",
  "wallet",
  "key",
  "secret",
  "token",
  "password",
  "cookie",
  "auth",
  "endpoint",
  "url",
  "href",
  "script",
  "html",
  "sql",
  "path",
  "file",
  "cmd",
  "exec",
];

/**
 * Drop unknown + sensitive keys. Body becomes allowlisted only.
 */
export function filterPingBody(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    const key = k.trim();
    if (!key || key.length > 32) continue;
    const lower = key.toLowerCase();
    if (BANNED_KEY_SUBSTR.some((b) => lower.includes(b))) continue;
    if (!ALLOWED_PING_KEYS.has(key)) continue;
    // Reject nested objects/arrays (injection via structure)
    if (v !== null && typeof v === "object") continue;
    if (typeof v === "function") continue;
    out[key] = v;
  }
  return out;
}

/** Re-sanitize any string that will be rendered (defense in depth on read path) */
export function escapeForDisplay(s: string, max = 48): string {
  return sanitizeLabel(s, "node", max);
}
