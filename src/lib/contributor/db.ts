import type { ContributorUser } from "./types";

export type D1Result<T = unknown> = {
  results?: T[];
  success: boolean;
  meta?: Record<string, unknown>;
};

export type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
};

export type ContributorDatabase = {
  prepare(query: string): D1Statement;
  batch<T = unknown>(statements: D1Statement[]): Promise<D1Result<T>[]>;
};

export async function contributorDb(): Promise<ContributorDatabase> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as { CONTRIBUTOR_DB?: ContributorDatabase }).CONTRIBUTOR_DB;
  if (!db) throw new ContributorError(503, "Contributor database is not configured");
  return db;
}

export async function findUserById(id: string): Promise<ContributorUser | null> {
  return (await contributorDb())
    .prepare("SELECT * FROM contributor_users WHERE id = ?")
    .bind(id)
    .first<ContributorUser>();
}

export async function audit(input: {
  action: string;
  actorId?: string | null;
  targetId?: string | null;
  detail?: Record<string, unknown>;
  ipHash?: string | null;
}): Promise<void> {
  const db = await contributorDb();
  await db
    .prepare(
      `INSERT INTO contributor_audit_log
       (id, actor_user_id, target_user_id, action, detail, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      input.actorId ?? null,
      input.targetId ?? null,
      input.action.slice(0, 80),
      input.detail ? JSON.stringify(input.detail).slice(0, 4000) : null,
      input.ipHash ?? null,
      Date.now(),
    )
    .run();
}

export class ContributorError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

