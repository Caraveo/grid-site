import { NextResponse } from "next/server";
import { currentContributor } from "@/lib/contributor/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let authenticated = false;
  let username: string | null = null;

  try {
    const user = await currentContributor(request);
    authenticated = true;
    username = user.username;
  } catch {
    // Public-safe status response: authentication failures and unavailable
    // local bindings are intentionally indistinguishable.
  }

  return NextResponse.json(
    {
      authenticated,
      username,
      mode: process.env.TRANSACT_LIVE_ENABLED === "true" ? "live" : "sandbox",
      stripeOnramp:
        process.env.STRIPE_ONRAMP_ENABLED === "true" ? "configured" : "pending",
      settlement: process.env.TRANSACT_LIVE_ENABLED === "true" ? "enabled" : "disabled",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
