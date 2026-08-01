import { contributorDb, ContributorError, findUserById } from "./db";
import { randomToken, sha256 } from "./crypto";
import { clientIpHash } from "./request";
import type { ContributorRole, ContributorUser } from "./types";

export const CONTRIBUTOR_COOKIE = "grid_contributor_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function cookieValue(request: Request): string | null {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === CONTRIBUTOR_COOKIE) return value.join("=") || null;
  }
  return null;
}

export function contributorCookie(token: string, maxAge = SESSION_TTL_MS / 1000): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CONTRIBUTOR_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Priority=High; Max-Age=${maxAge}${secure}`;
}

export function clearContributorCookie(): string {
  return contributorCookie("", 0);
}

export async function createContributorSession(
  userId: string,
  request: Request,
): Promise<string> {
  const db = await contributorDb();
  const token = randomToken();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO contributor_sessions
       (id, user_id, token_hash, user_agent, ip_hash, created_at, last_seen_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      userId,
      await sha256(token),
      (request.headers.get("user-agent") ?? "").slice(0, 500),
      await clientIpHash(request),
      now,
      now,
      now + SESSION_TTL_MS,
    )
    .run();
  return token;
}

export async function currentContributor(
  request: Request,
  options: { role?: ContributorRole; allowSuspended?: boolean } = {},
): Promise<ContributorUser> {
  const token = cookieValue(request);
  if (!token) throw new ContributorError(401, "Sign in required");
  const db = await contributorDb();
  const session = await db
    .prepare(
      `SELECT id, user_id FROM contributor_sessions
       WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?`,
    )
    .bind(await sha256(token), Date.now())
    .first<{ id: string; user_id: string }>();
  if (!session) throw new ContributorError(401, "Session expired");
  const user = await findUserById(session.user_id);
  if (!user) throw new ContributorError(401, "Account not found");
  if (!options.allowSuspended && user.status !== "approved") {
    throw new ContributorError(403, `Account is ${user.status.replace("_", " ")}`);
  }
  if (options.role && user.role !== options.role) {
    throw new ContributorError(403, "Administrator access required");
  }
  await db
    .prepare("UPDATE contributor_sessions SET last_seen_at = ? WHERE id = ?")
    .bind(Date.now(), session.id)
    .run();
  return user;
}

export async function revokeCurrentSession(request: Request): Promise<void> {
  const token = cookieValue(request);
  if (!token) return;
  await (await contributorDb())
    .prepare("UPDATE contributor_sessions SET revoked_at = ? WHERE token_hash = ?")
    .bind(Date.now(), await sha256(token))
    .run();
}

