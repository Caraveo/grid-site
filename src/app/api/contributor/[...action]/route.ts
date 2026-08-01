import { NextResponse } from "next/server";
import {
  awsMailRequest,
  provisionInbox,
  sendSystemEmail,
} from "@/lib/contributor/aws-mail";
import {
  decryptSecret,
  encryptSecret,
  hashPassword,
  newTotpSecret,
  randomToken,
  sha256,
  verifyPassword,
  verifyTotp,
} from "@/lib/contributor/crypto";
import {
  audit,
  contributorDb,
  ContributorError,
  findUserById,
} from "@/lib/contributor/db";
import {
  assertSameOrigin,
  clientIpHash,
  enforceRateLimit,
  jsonBody,
  normalizeEmail,
  normalizeUsername,
} from "@/lib/contributor/request";
import {
  clearContributorCookie,
  contributorCookie,
  createContributorSession,
  currentContributor,
  revokeCurrentSession,
} from "@/lib/contributor/session";
import {
  authenticatePasskey,
  authenticationOptions,
  listPasskeys,
  registerPasskey,
  registrationOptions,
} from "@/lib/contributor/passkey";
import { consumeOneTimeToken, createOneTimeToken } from "@/lib/contributor/tokens";
import { publicContributor, type ContributorUser } from "@/lib/contributor/types";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

export const dynamic = "force-dynamic";
const HOUR = 60 * 60 * 1000;

type Context = { params: Promise<{ action: string[] }> };
type Body = Record<string, unknown>;

function ok(data: Record<string, unknown> = {}, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, ...data }, init);
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof ContributorError) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.status },
    );
  }
  console.error(JSON.stringify({
    event: "contributor_api_error",
    message: error instanceof Error ? error.message : String(error),
  }));
  return NextResponse.json(
    { ok: false, error: "Unexpected contributor service error" },
    { status: 500 },
  );
}

function appOrigin(request: Request): string {
  const configured = process.env.CONTRIBUTOR_APP_ORIGIN?.trim();
  return configured || new URL(request.url).origin;
}

async function sendVerification(user: ContributorUser, request: Request): Promise<void> {
  const token = await createOneTimeToken(user.id, "verify_email", 24 * HOUR);
  const url = `${appOrigin(request)}/login?verify=${encodeURIComponent(token)}`;
  await sendSystemEmail({
    to: user.recovery_email,
    subject: "Verify your GRID contributor account",
    text: `Verify your recovery email: ${url}\n\nThis link expires in 24 hours.`,
  });
}

async function register(request: Request): Promise<NextResponse> {
  await enforceRateLimit(request, "register", 5, HOUR);
  const body = await jsonBody<Body>(request);
  const username = normalizeUsername(body.username);
  const recoveryEmail = normalizeEmail(body.recoveryEmail);
  const passwordHash = await hashPassword(String(body.password ?? ""));
  const now = Date.now();
  const user: ContributorUser = {
    id: crypto.randomUUID(),
    username,
    recovery_email: recoveryEmail,
    password_hash: passwordHash,
    role: "contributor",
    status: "pending_email",
    email_verified_at: null,
    approved_at: null,
    approved_by: null,
    mail_inbox_id: null,
    mail_email: null,
    totp_secret_encrypted: null,
    totp_enabled_at: null,
    failed_login_count: 0,
    locked_until: null,
    mailbox_quota_mb: 1024,
    daily_send_limit: 100,
    daily_sent_count: 0,
    daily_sent_date: null,
    created_at: now,
    updated_at: now,
  };
  const db = await contributorDb();
  try {
    await db
      .prepare(
        `INSERT INTO contributor_users
         (id, username, recovery_email, password_hash, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        user.id,
        user.username,
        user.recovery_email,
        user.password_hash,
        user.role,
        user.status,
        now,
        now,
      )
      .run();
  } catch {
    throw new ContributorError(409, "Username or recovery email is already registered");
  }
  await audit({
    action: "account.registered",
    targetId: user.id,
    ipHash: await clientIpHash(request),
  });
  try {
    await sendVerification(user, request);
  } catch (error) {
    // Do not strand a username when the recovery message cannot be accepted.
    await db
      .prepare(
        "DELETE FROM contributor_users WHERE id = ? AND status = 'pending_email'",
      )
      .bind(user.id)
      .run();
    console.error(JSON.stringify({
      event: "contributor_verification_delivery_failed",
      userId: user.id,
      message: error instanceof Error ? error.message : String(error),
    }));
    throw new ContributorError(
      503,
      "Could not deliver the verification email. Please try again shortly.",
    );
  }
  return ok({ message: "Check your recovery email, then wait for administrator approval." });
}

async function verifyEmail(request: Request): Promise<NextResponse> {
  const { token } = await jsonBody<Body>(request);
  const userId = await consumeOneTimeToken(String(token ?? ""), "verify_email");
  const user = await findUserById(userId);
  if (!user) throw new ContributorError(404, "Account not found");
  const bootstrapEmail = (
    process.env.CONTRIBUTOR_BOOTSTRAP_ADMIN_EMAIL ?? "hi@grid-compute.com"
  ).toLowerCase();
  const isBootstrapAdmin = user.recovery_email === bootstrapEmail;
  const db = await contributorDb();
  await db
    .prepare(
      `UPDATE contributor_users SET
       email_verified_at = ?, status = ?, role = ?, approved_at = ?,
       updated_at = ? WHERE id = ?`,
    )
    .bind(
      Date.now(),
      isBootstrapAdmin ? "approved" : "pending_approval",
      isBootstrapAdmin ? "admin" : user.role,
      isBootstrapAdmin ? Date.now() : null,
      Date.now(),
      user.id,
    )
    .run();
  await audit({
    action: isBootstrapAdmin ? "account.bootstrap_admin_verified" : "account.email_verified",
    targetId: user.id,
    ipHash: await clientIpHash(request),
  });
  return ok({
    message: isBootstrapAdmin
      ? "Administrator account verified. Sign in to continue."
      : "Email verified. Your account is waiting for administrator approval.",
  });
}

async function login(request: Request): Promise<NextResponse> {
  await enforceRateLimit(request, "login", 30, 15 * 60_000);
  const body = await jsonBody<Body>(request);
  const identity = String(body.identity ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const db = await contributorDb();
  const user = await db
    .prepare(
      "SELECT * FROM contributor_users WHERE username = ? COLLATE NOCASE OR recovery_email = ? COLLATE NOCASE",
    )
    .bind(identity, identity)
    .first<ContributorUser>();
  const valid = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !valid) {
    if (user) {
      const failures = user.failed_login_count + 1;
      await db
        .prepare(
          "UPDATE contributor_users SET failed_login_count = ?, locked_until = ?, updated_at = ? WHERE id = ?",
        )
        .bind(
          failures,
          failures >= 8 ? Date.now() + 15 * 60_000 : null,
          Date.now(),
          user.id,
        )
        .run();
    }
    throw new ContributorError(401, "Invalid credentials");
  }
  if (user.locked_until && user.locked_until > Date.now()) {
    throw new ContributorError(429, "Account temporarily locked. Try again later.");
  }
  if (user.status !== "approved") {
    throw new ContributorError(403, `Account is ${user.status.replace("_", " ")}`);
  }
  await db
    .prepare(
      "UPDATE contributor_users SET failed_login_count = 0, locked_until = NULL, updated_at = ? WHERE id = ?",
    )
    .bind(Date.now(), user.id)
    .run();
  if (user.totp_enabled_at) {
    const ticket = await createOneTimeToken(user.id, "login_2fa", 10 * 60_000);
    return ok({ requires2fa: true, ticket });
  }
  const session = await createContributorSession(user.id, request);
  await audit({
    action: "session.login",
    actorId: user.id,
    ipHash: await clientIpHash(request),
  });
  const response = ok({ user: publicContributor(user) });
  response.headers.set("Set-Cookie", contributorCookie(session));
  return response;
}

async function verifyLogin2fa(request: Request): Promise<NextResponse> {
  const body = await jsonBody<Body>(request);
  const userId = await consumeOneTimeToken(String(body.ticket ?? ""), "login_2fa");
  const user = await findUserById(userId);
  if (!user?.totp_secret_encrypted || !user.totp_enabled_at) {
    throw new ContributorError(400, "Two-factor authentication is not configured");
  }
  let valid = await verifyTotp(
    await decryptSecret(user.totp_secret_encrypted),
    String(body.code ?? "").replace(/\s/g, ""),
  );
  if (!valid) {
    const hash = await sha256(
      String(body.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
    );
    const db = await contributorDb();
    const recovery = await db
      .prepare(
        "SELECT id FROM contributor_recovery_codes WHERE user_id = ? AND code_hash = ? AND used_at IS NULL",
      )
      .bind(user.id, hash)
      .first<{ id: string }>();
    if (recovery) {
      valid = true;
      await db
        .prepare("UPDATE contributor_recovery_codes SET used_at = ? WHERE id = ?")
        .bind(Date.now(), recovery.id)
        .run();
    }
  }
  if (!valid) throw new ContributorError(401, "Invalid authenticator or recovery code");
  const session = await createContributorSession(user.id, request);
  await audit({
    action: "session.login_2fa",
    actorId: user.id,
    ipHash: await clientIpHash(request),
  });
  const response = ok({ user: publicContributor(user) });
  response.headers.set("Set-Cookie", contributorCookie(session));
  return response;
}

async function findUserByIdentity(identityValue: unknown): Promise<ContributorUser | null> {
  const identity = String(identityValue ?? "").trim().toLowerCase();
  if (!identity) return null;
  return (await contributorDb())
    .prepare(
      `SELECT * FROM contributor_users
       WHERE username = ? COLLATE NOCASE
       OR recovery_email = ? COLLATE NOCASE
       OR mail_email = ? COLLATE NOCASE`,
    )
    .bind(identity, identity, identity)
    .first<ContributorUser>();
}

async function passkeyRegisterOptions(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  const data = await registrationOptions(user);
  await audit({ action: "security.passkey_registration_started", actorId: user.id });
  return ok(data);
}

async function passkeyRegisterVerify(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  const body = await jsonBody<Body>(request);
  const credentialId = await registerPasskey({
    request,
    user,
    challengeId: String(body.challengeId ?? ""),
    response: body.response as RegistrationResponseJSON,
    deviceName: String(body.deviceName ?? ""),
  });
  await audit({
    action: "security.passkey_added",
    actorId: user.id,
    detail: { credentialId: credentialId.slice(0, 24) },
  });
  return ok({ passkeys: await listPasskeys(user.id) });
}

async function passkeyAuthOptions(request: Request): Promise<NextResponse> {
  await enforceRateLimit(request, "passkey_auth", 30, 15 * 60_000);
  const body = await jsonBody<Body>(request);
  const user = await findUserByIdentity(body.identity);
  if (!user || user.status !== "approved") {
    throw new ContributorError(404, "No passkey is available for this account");
  }
  return ok(await authenticationOptions(user));
}

async function passkeyAuthVerify(request: Request): Promise<NextResponse> {
  await enforceRateLimit(request, "passkey_verify", 30, 15 * 60_000);
  const body = await jsonBody<Body>(request);
  const user = await findUserByIdentity(body.identity);
  if (!user || user.status !== "approved") {
    throw new ContributorError(401, "Passkey authentication failed");
  }
  await authenticatePasskey({
    request,
    user,
    challengeId: String(body.challengeId ?? ""),
    response: body.response as AuthenticationResponseJSON,
  });
  const session = await createContributorSession(user.id, request);
  await audit({
    action: "session.passkey_login",
    actorId: user.id,
    ipHash: await clientIpHash(request),
  });
  const response = ok({ user: publicContributor(user) });
  response.headers.set("Set-Cookie", contributorCookie(session));
  return response;
}

async function passkeysApi(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  if (request.method === "GET") return ok({ passkeys: await listPasskeys(user.id) });
  const body = await jsonBody<Body>(request);
  const credentialId = String(body.credentialId ?? "");
  if (!credentialId) throw new ContributorError(400, "Passkey id required");
  const db = await contributorDb();
  await db
    .prepare("DELETE FROM contributor_passkeys WHERE credential_id = ? AND user_id = ?")
    .bind(credentialId, user.id)
    .run();
  await audit({ action: "security.passkey_removed", actorId: user.id });
  return ok({ passkeys: await listPasskeys(user.id) });
}

async function forgotPassword(request: Request): Promise<NextResponse> {
  await enforceRateLimit(request, "password_reset", 5, HOUR);
  const { email } = await jsonBody<Body>(request);
  const normalized = normalizeEmail(email);
  const user = await (await contributorDb())
    .prepare("SELECT * FROM contributor_users WHERE recovery_email = ? COLLATE NOCASE")
    .bind(normalized)
    .first<ContributorUser>();
  if (user) {
    const token = await createOneTimeToken(user.id, "password_reset", HOUR);
    const url = `${appOrigin(request)}/login?reset=${encodeURIComponent(token)}`;
    await sendSystemEmail({
      to: user.recovery_email,
      subject: "Reset your GRID contributor password",
      text: `Reset your password: ${url}\n\nThis link expires in one hour.`,
    });
    await audit({ action: "password.reset_requested", targetId: user.id });
  }
  return ok({ message: "If that address is registered, a reset link has been sent." });
}

async function resetPassword(request: Request): Promise<NextResponse> {
  const body = await jsonBody<Body>(request);
  const userId = await consumeOneTimeToken(String(body.token ?? ""), "password_reset");
  const passwordHash = await hashPassword(String(body.password ?? ""));
  const db = await contributorDb();
  await db.batch([
    db.prepare(
      "UPDATE contributor_users SET password_hash = ?, failed_login_count = 0, locked_until = NULL, updated_at = ? WHERE id = ?",
    ).bind(passwordHash, Date.now(), userId),
    db.prepare(
      "UPDATE contributor_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL",
    ).bind(Date.now(), userId),
  ]);
  await audit({ action: "password.reset_completed", targetId: userId });
  return ok({ message: "Password updated. Sign in again." });
}

async function changePassword(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  const body = await jsonBody<Body>(request);
  const passwordHash = await hashPassword(String(body.password ?? ""));
  await (await contributorDb())
    .prepare(
      `UPDATE contributor_users
       SET password_hash = ?, failed_login_count = 0, locked_until = NULL, updated_at = ?
       WHERE id = ?`,
    )
    .bind(passwordHash, Date.now(), user.id)
    .run();
  await audit({ action: "password.changed", actorId: user.id });
  return ok({ message: "Password updated." });
}

async function setup2fa(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  const secret = newTotpSecret();
  await (await contributorDb())
    .prepare(
      "UPDATE contributor_users SET totp_secret_encrypted = ?, totp_enabled_at = NULL, updated_at = ? WHERE id = ?",
    )
    .bind(await encryptSecret(secret), Date.now(), user.id)
    .run();
  const issuer = encodeURIComponent("GRID Compute");
  const label = encodeURIComponent(`GRID Compute:${user.username}`);
  return ok({
    secret,
    otpauth: `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`,
  });
}

async function enable2fa(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  const { code } = await jsonBody<Body>(request);
  const fresh = await findUserById(user.id);
  if (!fresh?.totp_secret_encrypted) {
    throw new ContributorError(400, "Start two-factor setup first");
  }
  if (!(await verifyTotp(await decryptSecret(fresh.totp_secret_encrypted), String(code ?? "")))) {
    throw new ContributorError(400, "Authenticator code did not match");
  }
  const codes = Array.from({ length: 10 }, () => {
    const raw = randomToken(8).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  const db = await contributorDb();
  const now = Date.now();
  await db.batch([
    db.prepare("DELETE FROM contributor_recovery_codes WHERE user_id = ?").bind(user.id),
    ...await Promise.all(
      codes.map(async (codeValue) =>
        db.prepare(
          "INSERT INTO contributor_recovery_codes (id, user_id, code_hash, created_at) VALUES (?, ?, ?, ?)",
        ).bind(
          crypto.randomUUID(),
          user.id,
          await sha256(codeValue.replace("-", "")),
          now,
        ),
      ),
    ),
    db.prepare(
      "UPDATE contributor_users SET totp_enabled_at = ?, updated_at = ? WHERE id = ?",
    ).bind(now, now, user.id),
  ]);
  await audit({ action: "security.2fa_enabled", actorId: user.id });
  return ok({ recoveryCodes: codes });
}

async function adminUsers(request: Request): Promise<NextResponse> {
  const admin = await currentContributor(request, { role: "admin" });
  const result = await (await contributorDb())
    .prepare(
      `SELECT id, username, recovery_email, role, status, email_verified_at,
       approved_at, approved_by, mail_inbox_id, mail_email,
       totp_enabled_at, failed_login_count, locked_until, mailbox_quota_mb,
       daily_send_limit, daily_sent_count, daily_sent_date, created_at, updated_at,
       EXISTS(SELECT 1 FROM contributor_task_moderators m WHERE m.user_id = contributor_users.id)
         AS is_task_moderator
       FROM contributor_users ORDER BY created_at DESC LIMIT 500`,
    )
    .all<Record<string, unknown>>();
  return ok({ users: result.results ?? [], admin: publicContributor(admin) });
}

async function sessionsApi(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  const db = await contributorDb();
  if (request.method === "GET") {
    const result = await db
      .prepare(
        `SELECT id, user_agent, created_at, last_seen_at, expires_at
         FROM contributor_sessions
         WHERE user_id = ? AND revoked_at IS NULL AND expires_at > ?
         ORDER BY last_seen_at DESC`,
      )
      .bind(user.id, Date.now())
      .all<Record<string, unknown>>();
    return ok({ sessions: result.results ?? [] });
  }
  const { sessionId } = await jsonBody<Body>(request);
  await db
    .prepare(
      "UPDATE contributor_sessions SET revoked_at = ? WHERE id = ? AND user_id = ?",
    )
    .bind(Date.now(), String(sessionId ?? ""), user.id)
    .run();
  await audit({ action: "session.revoked", actorId: user.id });
  return ok();
}

async function adminAudit(request: Request): Promise<NextResponse> {
  await currentContributor(request, { role: "admin" });
  const result = await (await contributorDb())
    .prepare(
      `SELECT a.id, a.action, a.detail, a.created_at,
       actor.username AS actor_username, target.username AS target_username
       FROM contributor_audit_log a
       LEFT JOIN contributor_users actor ON actor.id = a.actor_user_id
       LEFT JOIN contributor_users target ON target.id = a.target_user_id
       ORDER BY a.created_at DESC LIMIT 500`,
    )
    .all<Record<string, unknown>>();
  return ok({ events: result.results ?? [] });
}

async function adminUpdateUser(request: Request): Promise<NextResponse> {
  const admin = await currentContributor(request, { role: "admin" });
  const body = await jsonBody<Body>(request);
  const userId = String(body.userId ?? "");
  const action = String(body.action ?? "");
  const user = await findUserById(userId);
  if (!user) throw new ContributorError(404, "Contributor not found");
  const db = await contributorDb();
  if (action === "approve" || action === "provision") {
    if (!user.email_verified_at) throw new ContributorError(400, "Recovery email is not verified");
    let inboxId = user.mail_inbox_id;
    let email = user.mail_email;
    if (!inboxId) {
      const inbox = await provisionInbox(user);
      inboxId = inbox.inbox_id;
      email = inbox.email;
    }
    if (action === "approve") {
      await db
        .prepare(
          `UPDATE contributor_users SET status = 'approved', approved_at = ?,
           approved_by = ?, mail_inbox_id = ?, mail_email = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(Date.now(), admin.id, inboxId, email, Date.now(), user.id)
        .run();
    } else {
      if (user.status !== "approved") {
        throw new ContributorError(400, "Approve the contributor before provisioning");
      }
      await db
        .prepare(
          `UPDATE contributor_users SET mail_inbox_id = ?,
           mail_email = ?, updated_at = ? WHERE id = ?`,
        )
        .bind(inboxId, email, Date.now(), user.id)
        .run();
    }
  } else if (action === "suspend" || action === "reject") {
    if (user.id === admin.id) throw new ContributorError(400, "You cannot disable your own account");
    await db.batch([
      db.prepare("UPDATE contributor_users SET status = ?, updated_at = ? WHERE id = ?")
        .bind(action === "suspend" ? "suspended" : "rejected", Date.now(), user.id),
      db.prepare(
        "UPDATE contributor_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL",
      ).bind(Date.now(), user.id),
    ]);
  } else if (action === "restore") {
    await db
      .prepare("UPDATE contributor_users SET status = 'approved', updated_at = ? WHERE id = ?")
      .bind(Date.now(), user.id)
      .run();
  } else if (action === "grant_task_moderator") {
    if (user.status !== "approved") throw new ContributorError(400, "Approve the contributor first");
    await db
      .prepare(
        `INSERT INTO contributor_task_moderators (user_id, granted_by, created_at)
         VALUES (?, ?, ?) ON CONFLICT(user_id) DO NOTHING`,
      )
      .bind(user.id, admin.id, Date.now())
      .run();
  } else if (action === "revoke_task_moderator") {
    await db
      .prepare("DELETE FROM contributor_task_moderators WHERE user_id = ?")
      .bind(user.id)
      .run();
  } else {
    throw new ContributorError(400, "Unknown administrator action");
  }
  await audit({
    action: `admin.${action}`,
    actorId: admin.id,
    targetId: user.id,
  });
  return ok();
}

async function isTaskManager(user: ContributorUser): Promise<boolean> {
  if (user.role === "admin") return true;
  const row = await (await contributorDb())
    .prepare("SELECT 1 AS allowed FROM contributor_task_moderators WHERE user_id = ?")
    .bind(user.id)
    .first<{ allowed: number }>();
  return Boolean(row?.allowed);
}

async function taskList(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  const manager = await isTaskManager(user);
  const scope = new URL(request.url).searchParams.get("scope");
  const db = await contributorDb();
  const where = manager && scope === "all" ? "" : "WHERE t.assigned_to = ?";
  const statement = db.prepare(
    `SELECT t.*, assignee.username AS assignee_username,
     creator.username AS creator_username,
     (SELECT COUNT(*) FROM contributor_task_comments c WHERE c.task_id = t.id) AS comment_count
     FROM contributor_tasks t
     JOIN contributor_users assignee ON assignee.id = t.assigned_to
     JOIN contributor_users creator ON creator.id = t.created_by
     ${where}
     ORDER BY
       CASE t.status WHEN 'in_progress' THEN 0 WHEN 'todo' THEN 1 WHEN 'blocked' THEN 2 ELSE 3 END,
       CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
       COALESCE(t.due_at, 9223372036854775807), t.updated_at DESC
     LIMIT 500`,
  );
  const result = where ? await statement.bind(user.id).all<Record<string, unknown>>()
    : await statement.all<Record<string, unknown>>();
  const contributors = manager
    ? (await db.prepare(
      `SELECT id, username, mail_email FROM contributor_users
       WHERE status = 'approved' ORDER BY username`,
    ).all<Record<string, unknown>>()).results ?? []
    : [];
  return ok({ tasks: result.results ?? [], contributors, canManage: manager });
}

async function taskComments(request: Request): Promise<NextResponse> {
  const user = await currentContributor(request);
  const taskId = new URL(request.url).searchParams.get("id") ?? "";
  const db = await contributorDb();
  const task = await db.prepare("SELECT assigned_to FROM contributor_tasks WHERE id = ?")
    .bind(taskId).first<{ assigned_to: string }>();
  if (!task) throw new ContributorError(404, "Task not found");
  if (task.assigned_to !== user.id && !(await isTaskManager(user))) {
    throw new ContributorError(403, "Task access denied");
  }
  const result = await db.prepare(
    `SELECT c.id, c.body, c.created_at, c.author_id, u.username AS author_username
     FROM contributor_task_comments c
     JOIN contributor_users u ON u.id = c.author_id
     WHERE c.task_id = ? ORDER BY c.created_at ASC`,
  ).bind(taskId).all<Record<string, unknown>>();
  return ok({ comments: result.results ?? [] });
}

async function taskMutation(request: Request, operation: string): Promise<NextResponse> {
  const user = await currentContributor(request);
  const body = await jsonBody<Body>(request);
  const db = await contributorDb();
  const manager = await isTaskManager(user);
  if (operation === "create") {
    if (!manager) throw new ContributorError(403, "Task manager access required");
    const title = String(body.title ?? "").trim().slice(0, 160);
    const description = String(body.description ?? "").trim().slice(0, 20_000);
    const assignedTo = String(body.assignedTo ?? "");
    const priority = String(body.priority ?? "normal");
    const dueAt = body.dueAt ? Date.parse(String(body.dueAt)) : null;
    if (!title) throw new ContributorError(400, "Task title is required");
    if (!["low", "normal", "high", "urgent"].includes(priority)) {
      throw new ContributorError(400, "Invalid priority");
    }
    const assignee = await findUserById(assignedTo);
    if (!assignee || assignee.status !== "approved") {
      throw new ContributorError(400, "Choose an approved contributor");
    }
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.prepare(
      `INSERT INTO contributor_tasks
       (id, title, description, priority, assigned_to, created_by, due_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, title, description, priority, assignee.id, user.id,
      dueAt && Number.isFinite(dueAt) ? dueAt : null, now, now).run();
    await audit({ action: "task.created", actorId: user.id, targetId: assignee.id, detail: { taskId: id } });
    return ok({ taskId: id });
  }
  const taskId = String(body.taskId ?? "");
  const task = await db.prepare("SELECT * FROM contributor_tasks WHERE id = ?")
    .bind(taskId).first<Record<string, unknown>>();
  if (!task) throw new ContributorError(404, "Task not found");
  const assignedTo = String(task.assigned_to);
  if (assignedTo !== user.id && !manager) throw new ContributorError(403, "Task access denied");
  if (operation === "status") {
    const status = String(body.status ?? "");
    if (!["todo", "in_progress", "blocked", "done"].includes(status)) {
      throw new ContributorError(400, "Invalid task status");
    }
    const now = Date.now();
    await db.prepare(
      `UPDATE contributor_tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?`,
    ).bind(status, status === "done" ? now : null, now, taskId).run();
    await audit({ action: `task.${status}`, actorId: user.id, targetId: assignedTo, detail: { taskId } });
  } else if (operation === "comment") {
    const comment = String(body.comment ?? "").trim().slice(0, 5000);
    if (!comment) throw new ContributorError(400, "Comment is required");
    await db.prepare(
      `INSERT INTO contributor_task_comments (id, task_id, author_id, body, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), taskId, user.id, comment, Date.now()).run();
    await db.prepare("UPDATE contributor_tasks SET updated_at = ? WHERE id = ?")
      .bind(Date.now(), taskId).run();
    await audit({ action: "task.commented", actorId: user.id, targetId: assignedTo, detail: { taskId } });
  } else if (operation === "delete") {
    if (!manager) throw new ContributorError(403, "Task manager access required");
    await db.prepare("DELETE FROM contributor_tasks WHERE id = ?").bind(taskId).run();
    await audit({ action: "task.deleted", actorId: user.id, targetId: assignedTo, detail: { taskId } });
  } else {
    throw new ContributorError(404, "Unknown task operation");
  }
  return ok();
}

function mailText(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

function mailRecipients(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  const cleaned = values.map((entry) => normalizeEmail(entry)).slice(0, 50);
  if (!cleaned.length) throw new ContributorError(400, "At least one recipient is required");
  return cleaned;
}

async function mailApi(request: Request, parts: string[]): Promise<NextResponse> {
  const user = await currentContributor(request);
  if (!user.mail_inbox_id || !user.mail_email) {
    throw new ContributorError(409, "Mailbox is not provisioned");
  }
  const operation = parts[1] ?? "threads";
  const url = new URL(request.url);

  if (request.method === "GET" && operation === "threads") {
    const query = url.searchParams.get("q")?.trim();
    const folder = url.searchParams.get("folder")?.trim() || "inbox";
    const data = await awsMailRequest<Record<string, unknown>>(
      `/threads?folder=${encodeURIComponent(folder)}${query ? `&q=${encodeURIComponent(query)}` : ""}`,
      user.mail_email,
    );
    return ok({ data });
  }
  if (request.method === "GET" && operation === "thread") {
    const id = encodeURIComponent(url.searchParams.get("id") ?? "");
    if (!id) throw new ContributorError(400, "Thread id required");
    return ok({
      data: await awsMailRequest(`/thread?id=${id}`, user.mail_email),
    });
  }
  if (request.method === "GET" && operation === "drafts") {
    return ok({
      data: await awsMailRequest("/drafts", user.mail_email),
    });
  }
  if (request.method === "GET" && operation === "attachment") {
    const message = url.searchParams.get("message") ?? "";
    const attachment = url.searchParams.get("attachment") ?? "";
    if (!message || !attachment) {
      throw new ContributorError(400, "Attachment identifiers are required");
    }
    return ok({
      data: await awsMailRequest(
        `/attachment?message=${encodeURIComponent(message)}&attachment=${encodeURIComponent(attachment)}`,
        user.mail_email,
      ),
    });
  }
  const body = await jsonBody<Body>(request, 2_000_000);
  if (request.method === "POST" && operation === "thread-action") {
    const threadId = String(body.threadId ?? "").slice(0, 128);
    const action = String(body.action ?? "").toLowerCase();
    if (!threadId) throw new ContributorError(400, "Thread id required");
    if (!["archive", "trash", "restore", "delete", "read", "unread"].includes(action)) {
      throw new ContributorError(400, "Unknown thread action");
    }
    const data = await awsMailRequest("/thread/action", user.mail_email, {
      method: "POST",
      body: JSON.stringify({ threadId, action }),
    });
    await audit({ action: `mail.${action}`, actorId: user.id });
    return ok({ data });
  }
  if (request.method === "POST" && operation === "send") {
    const today = new Date().toISOString().slice(0, 10);
    const sentToday = user.daily_sent_date === today ? user.daily_sent_count : 0;
    if (sentToday >= user.daily_send_limit) {
      throw new ContributorError(429, "Daily mailbox send limit reached");
    }
    const data = await awsMailRequest("/send", user.mail_email, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({
        to: mailRecipients(body.to),
        cc: body.cc ? mailRecipients(body.cc) : undefined,
        bcc: body.bcc ? mailRecipients(body.bcc) : undefined,
        subject: mailText(body.subject, 998),
        text: mailText(body.text, 500_000),
        html: body.html ? mailText(body.html, 500_000) : undefined,
      }),
    });
    await (await contributorDb())
      .prepare(
        `UPDATE contributor_users SET daily_sent_date = ?,
         daily_sent_count = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(today, sentToday + 1, Date.now(), user.id)
      .run();
    await audit({ action: "mail.sent", actorId: user.id });
    return ok({ data });
  }
  if (request.method === "POST" && ["reply", "reply-all", "forward"].includes(operation)) {
    const messageId = String(body.messageId ?? "").slice(0, 998);
    if (!messageId) throw new ContributorError(400, "Message id required");
    const payload = operation === "forward"
      ? { messageId, to: mailRecipients(body.to), text: mailText(body.text, 500_000) }
      : { messageId, text: mailText(body.text, 500_000) };
    const data = await awsMailRequest(
      `/${operation}`,
      user.mail_email,
      {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(payload),
      },
    );
    await audit({ action: `mail.${operation}`, actorId: user.id });
    return ok({ data });
  }
  if (request.method === "POST" && operation === "draft") {
    const data = await awsMailRequest("/draft", user.mail_email, {
      method: "POST",
      body: JSON.stringify({
        to: body.to ? mailRecipients(body.to) : [],
        subject: mailText(body.subject, 998),
        text: mailText(body.text, 500_000),
      }),
    });
    return ok({ data });
  }
  throw new ContributorError(404, "Unknown mail operation");
}

export async function GET(request: Request, context: Context): Promise<NextResponse> {
  try {
    const parts = (await context.params).action;
    if (parts[0] === "me") {
      const user = await currentContributor(request, { allowSuspended: true });
      return ok({ user: publicContributor(user) });
    }
    if (parts[0] === "sessions") return await sessionsApi(request);
    if (parts[0] === "passkeys") return await passkeysApi(request);
    if (parts[0] === "tasks" && parts[1] === "comments") return await taskComments(request);
    if (parts[0] === "tasks") return await taskList(request);
    if (parts[0] === "admin" && parts[1] === "users") return await adminUsers(request);
    if (parts[0] === "admin" && parts[1] === "audit") return await adminAudit(request);
    if (parts[0] === "mail") return await mailApi(request, parts);
    throw new ContributorError(404, "Unknown contributor endpoint");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: Context): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    const parts = (await context.params).action;
    const action = parts.join("/");
    if (action === "register") return await register(request);
    if (action === "verify-email") return await verifyEmail(request);
    if (action === "login") return await login(request);
    if (action === "login/2fa") return await verifyLogin2fa(request);
    if (action === "passkey/register-options") return await passkeyRegisterOptions(request);
    if (action === "passkey/register-verify") return await passkeyRegisterVerify(request);
    if (action === "passkey/auth-options") return await passkeyAuthOptions(request);
    if (action === "passkey/auth-verify") return await passkeyAuthVerify(request);
    if (action === "passkeys/delete") return await passkeysApi(request);
    if (parts[0] === "tasks") return await taskMutation(request, parts[1] ?? "");
    if (action === "password/forgot") return await forgotPassword(request);
    if (action === "password/reset") return await resetPassword(request);
    if (action === "password/change") return await changePassword(request);
    if (action === "2fa/setup") return await setup2fa(request);
    if (action === "2fa/enable") return await enable2fa(request);
    if (action === "admin/user") return await adminUpdateUser(request);
    if (action === "sessions/revoke") return await sessionsApi(request);
    if (parts[0] === "mail") return await mailApi(request, parts);
    if (action === "logout") {
      await revokeCurrentSession(request);
      const response = ok();
      response.headers.set("Set-Cookie", clearContributorCookie());
      return response;
    }
    throw new ContributorError(404, "Unknown contributor endpoint");
  } catch (error) {
    return errorResponse(error);
  }
}
