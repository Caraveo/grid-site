import { NextResponse } from "next/server";
import {
  createAuthenticationOptions,
  createRegistrationOptions,
  PasskeyError,
  verifyAndStoreRegistration,
  verifyAuthentication,
} from "@/lib/passkey";
import {
  attachPasskeyToRegistration,
  getRegistration,
  RegError,
} from "@/lib/registration-store";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/registry/passkey
 *
 * WebAuthn passkeys for registry identity.
 *
 * Actions:
 *  register_options  { regId }
 *  register_verify   { regId, challengeKey, response }
 *  auth_options      { name? }
 *  auth_verify       { challengeKey, response }
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "").toLowerCase();

  try {
    if (action === "register_options") {
      const regId = String(body.regId ?? "");
      const reg = await getRegistration(regId);
      if (!reg) {
        return NextResponse.json(
          { ok: false, error: "registration not found" },
          { status: 404 },
        );
      }
      const { options, challengeKey } = await createRegistrationOptions({
        userId: reg.id,
        userName: reg.name,
        userDisplayName: reg.label || reg.name,
      });
      return NextResponse.json({
        ok: true,
        challengeKey,
        options,
      });
    }

    if (action === "register_verify") {
      const regId = String(body.regId ?? "");
      const challengeKey = String(body.challengeKey ?? "");
      const response = body.response as RegistrationResponseJSON;
      if (!regId || !challengeKey || !response) {
        return NextResponse.json(
          { ok: false, error: "regId, challengeKey, response required" },
          { status: 400 },
        );
      }
      const reg = await getRegistration(regId);
      if (!reg) {
        return NextResponse.json(
          { ok: false, error: "registration not found" },
          { status: 404 },
        );
      }
      const { credId } = await verifyAndStoreRegistration({
        challengeKey,
        response,
        regId,
        name: reg.name,
      });
      const updated = await attachPasskeyToRegistration(regId, credId);
      return NextResponse.json({
        ok: true,
        credId,
        registration: {
          id: updated.id,
          name: updated.name,
          hasPasskey: true,
          status: updated.status,
        },
      });
    }

    if (action === "auth_options") {
      const name =
        body.name != null ? String(body.name).toLowerCase() : undefined;
      const { options, challengeKey } = await createAuthenticationOptions({
        name,
      });
      return NextResponse.json({ ok: true, challengeKey, options });
    }

    if (action === "auth_verify") {
      const challengeKey = String(body.challengeKey ?? "");
      const response = body.response as AuthenticationResponseJSON;
      if (!challengeKey || !response) {
        return NextResponse.json(
          { ok: false, error: "challengeKey and response required" },
          { status: 400 },
        );
      }
      const result = await verifyAuthentication({ challengeKey, response });
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "unknown action (register_options|register_verify|auth_options|auth_verify)",
      },
      { status: 400 },
    );
  } catch (e) {
    if (e instanceof PasskeyError || e instanceof RegError) {
      return NextResponse.json(
        { ok: false, error: (e as Error).message },
        { status: (e as PasskeyError).status },
      );
    }
    console.error("[IdentityKey]", e);
    return NextResponse.json(
      { ok: false, error: "IdentityKey error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    product: "IdentityKey",
    supports: [
      "platform authenticators",
      "roaming authenticators (USB/NFC security keys)",
    ],
  });
}
