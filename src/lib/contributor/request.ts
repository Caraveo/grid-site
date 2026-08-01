import { contributorDb, ContributorError } from "./db";
import { sha256 } from "./crypto";

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = new URL(request.url).origin;
  if (origin !== expected) throw new ContributorError(403, "Cross-origin request rejected");
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function clientIpHash(request: Request): Promise<string> {
  const pepper = process.env.CONTRIBUTOR_IP_PEPPER ?? "grid-contributor-ip";
  return sha256(`${pepper}:${clientIp(request)}`);
}

export async function enforceRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const db = await contributorDb();
  const subject = await clientIpHash(request);
  const now = Date.now();
  const current = await db
    .prepare(
      `SELECT window_started_at, request_count FROM contributor_rate_limits
       WHERE bucket = ? AND subject_hash = ?`,
    )
    .bind(bucket, subject)
    .first<{ window_started_at: number; request_count: number }>();
  if (!current || now - current.window_started_at >= windowMs) {
    await db
      .prepare(
        `INSERT INTO contributor_rate_limits
         (bucket, subject_hash, window_started_at, request_count) VALUES (?, ?, ?, 1)
         ON CONFLICT(bucket, subject_hash) DO UPDATE SET
         window_started_at = excluded.window_started_at, request_count = 1`,
      )
      .bind(bucket, subject, now)
      .run();
    return;
  }
  if (current.request_count >= limit) {
    throw new ContributorError(429, "Too many requests. Try again later.");
  }
  await db
    .prepare(
      `UPDATE contributor_rate_limits SET request_count = request_count + 1
       WHERE bucket = ? AND subject_hash = ?`,
    )
    .bind(bucket, subject)
    .run();
}

export async function jsonBody<T extends Record<string, unknown>>(
  request: Request,
  maxBytes = 64_000,
): Promise<T> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > maxBytes) throw new ContributorError(413, "Request is too large");
  const text = await request.text();
  if (text.length > maxBytes) throw new ContributorError(413, "Request is too large");
  try {
    return JSON.parse(text || "{}") as T;
  } catch {
    throw new ContributorError(400, "Invalid JSON");
  }
}

export function normalizeUsername(value: unknown): string {
  const username = String(value ?? "").trim().toLowerCase();
  if (!/^[a-z][a-z0-9._-]{2,31}$/.test(username)) {
    throw new ContributorError(
      400,
      "Username must be 3–32 characters and use letters, numbers, dots, underscores, or hyphens",
    );
  }
  const reserved = new Set([
    "admin", "administrator", "abuse", "billing", "contact", "help", "hi",
    "hostmaster", "mail", "no-reply", "noreply", "postmaster", "security",
    "support", "webmaster", "www",
  ]);
  if (reserved.has(username)) throw new ContributorError(400, "That username is reserved");
  return username;
}

export function normalizeEmail(value: unknown): string {
  const email = String(value ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ContributorError(400, "Enter a valid recovery email");
  }
  return email;
}
