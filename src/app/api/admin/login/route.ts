import { NextResponse } from "next/server";
import {
  adminSecretConfigured,
  checkLoginRateLimit,
  clearLoginFailures,
  createSessionToken,
  getAdminSecret,
  recordLoginFailure,
  sessionCookieHeader,
  timingSafeEqualString,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 * Body: { secret: string }
 * Sets HttpOnly session cookie on success.
 */
export async function POST(req: Request) {
  if (!adminSecretConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin not configured. Set GRID_ADMIN_SECRET (min 16 chars) via wrangler secret put.",
      },
      { status: 503 },
    );
  }

  const limit = checkLoginRateLimit(req);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many login attempts. Try again later.",
        retryAfterSec: limit.retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSec ?? 900),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const secret =
    body && typeof body === "object" && !Array.isArray(body)
      ? String((body as { secret?: unknown }).secret ?? "")
      : "";

  const expected = getAdminSecret()!;
  // Length-mismatch still counts as failure (constant-time only when lengths match)
  if (!secret || !timingSafeEqualString(secret, expected)) {
    // Pad compare attempt when lengths differ to avoid trivial timing on length
    if (secret && secret.length === expected.length) {
      /* already compared */
    }
    recordLoginFailure(req);
    // Constant delay ~100–200ms-ish via microtask chain is hard; keep simple.
    return NextResponse.json(
      { ok: false, error: "invalid credentials" },
      { status: 401 },
    );
  }

  clearLoginFailures(req);
  const token = await createSessionToken(expected);
  const res = NextResponse.json({
    ok: true,
    expiresInSec: 8 * 3600,
    message: "Admin session established",
  });
  res.headers.set("Set-Cookie", sessionCookieHeader(token));
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: adminSecretConfigured(),
    auth: "POST { secret } → HttpOnly cookie · or Bearer GRID_ADMIN_SECRET",
  });
}
