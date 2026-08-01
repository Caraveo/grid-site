import { contributorDb, ContributorError } from "./db";
import { randomToken, sha256 } from "./crypto";

export type TokenKind = "verify_email" | "password_reset" | "login_2fa";

export async function createOneTimeToken(
  userId: string,
  kind: TokenKind,
  ttlMs: number,
): Promise<string> {
  const db = await contributorDb();
  const token = randomToken();
  const now = Date.now();
  await db.batch([
    db.prepare(
      "DELETE FROM contributor_tokens WHERE user_id = ? AND kind = ? AND used_at IS NULL",
    ).bind(userId, kind),
    db.prepare(
      `INSERT INTO contributor_tokens
       (id, user_id, kind, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      userId,
      kind,
      await sha256(token),
      now + ttlMs,
      now,
    ),
  ]);
  return token;
}

export async function consumeOneTimeToken(
  rawToken: string,
  kind: TokenKind,
): Promise<string> {
  const db = await contributorDb();
  const token = await db
    .prepare(
      `SELECT id, user_id FROM contributor_tokens
       WHERE token_hash = ? AND kind = ? AND used_at IS NULL AND expires_at > ?`,
    )
    .bind(await sha256(rawToken), kind, Date.now())
    .first<{ id: string; user_id: string }>();
  if (!token) throw new ContributorError(400, "Link or code is invalid or expired");
  await db
    .prepare("UPDATE contributor_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL")
    .bind(Date.now(), token.id)
    .run();
  return token.user_id;
}

