import { NextResponse } from "next/server";
import { clearSessionCookieHeader } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookieHeader());
  res.headers.set("Cache-Control", "no-store");
  return res;
}
