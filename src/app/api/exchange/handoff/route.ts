import { NextResponse } from "next/server";
import { ContributorError, contributorDb } from "@/lib/contributor/db";
import { randomToken, sha256 } from "@/lib/contributor/crypto";
import { currentContributor } from "@/lib/contributor/session";

const EXCHANGE_CALLBACK = "https://exchange.grid-compute.com/auth/callback";
const CODE_TTL_MS = 2 * 60 * 1000;

export async function GET(request: Request): Promise<NextResponse> {
  let user;
  try {
    user = await currentContributor(request);
  } catch (error) {
    if (error instanceof ContributorError && error.status !== 401) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("returnTo", "/api/exchange/handoff");
    return NextResponse.redirect(login);
  }

  if (!user.totp_enabled_at) {
    return NextResponse.json(
      { ok: false, error: "Authenticator 2FA is required for GRID Exchange" },
      { status: 403 },
    );
  }

  const db = await contributorDb();
  const now = Date.now();
  await db
    .prepare(
      `INSERT OR IGNORE INTO contributor_entitlements
       (user_id, entitlement, status, granted_at, updated_at)
       VALUES (?, 'gexuser', 'active', ?, ?)`,
    )
    .bind(user.id, now, now)
    .run();
  const entitlement = await db
    .prepare(
      `SELECT status FROM contributor_entitlements
       WHERE user_id = ? AND entitlement = 'gexuser'`,
    )
    .bind(user.id)
    .first<{ status: string }>();
  if (entitlement?.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "Active gexuser entitlement required" },
      { status: 403 },
    );
  }

  const code = randomToken();
  await db
    .prepare(
      `INSERT INTO exchange_auth_codes
       (id, user_id, code_hash, expires_at, used_at, created_at)
       VALUES (?, ?, ?, ?, NULL, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      user.id,
      await sha256(code),
      now + CODE_TTL_MS,
      now,
    )
    .run();

  const callback = new URL(EXCHANGE_CALLBACK);
  callback.searchParams.set("code", code);
  return NextResponse.redirect(callback);
}
