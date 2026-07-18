/**
 * Reserved terms — names blocked from public registration.
 * Built-in browser/system labels + brand seeds + admin-managed list.
 * Durable via MESH_KV (or local data/reserved-terms.json).
 */

const KV_KEY = "reserved-terms-v1";
const MAX_TERMS = 2_000;
const MAX_STORE_BYTES = 1_000_000;

export type ReservedSource = "system" | "brand" | "admin";

export type ReservedTerm = {
  /** lowercase grid label */
  term: string;
  /** display title */
  title: string;
  /** optional logo/brand key for MESH (google, me, microsoft, …) */
  brand?: string;
  note?: string;
  source: ReservedSource;
  createdAt: string;
  updatedAt: string;
};

type StoreFile = {
  updatedAt: string;
  byTerm: Record<string, ReservedTerm>;
};

type MeshKv = {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

let fsMemory: StoreFile | null = null;

/** MESH / registry system labels — never removable. */
export const SYSTEM_RESERVED: ReadonlyArray<{
  term: string;
  title: string;
  brand?: string;
}> = [
  { term: "home", title: "Home" },
  { term: "start", title: "Start" },
  { term: "newtab", title: "New tab" },
  { term: "registry", title: "Registry" },
  { term: "mesh", title: "Mesh" },
  { term: "peers", title: "Peers" },
  { term: "computes", title: "Computes" },
  { term: "status", title: "Status" },
  { term: "about", title: "About" },
  { term: "help", title: "Help" },
  { term: "docs", title: "Docs" },
  { term: "settings", title: "Settings" },
  { term: "config", title: "Config" },
  { term: "prefs", title: "Prefs" },
  { term: "error", title: "Error" },
  { term: "www", title: "WWW" },
  { term: "api", title: "API" },
  { term: "admin", title: "Admin" },
  { term: "grid", title: "GRID" },
  { term: "genesis", title: "Genesis" },
  { term: "site", title: "Site" },
];

/** Brand / logo-only realms shipped with MESH — removable by admin if needed. */
export const BRAND_RESERVED: ReadonlyArray<{
  term: string;
  title: string;
  brand: string;
}> = [
  { term: "google", title: "Google", brand: "google" },
  { term: "youtube", title: "YouTube", brand: "youtube" },
  { term: "apple", title: "Apple", brand: "apple" },
  { term: "x", title: "X", brand: "x" },
  { term: "twitter", title: "X", brand: "x" },
  { term: "spacex", title: "SpaceX", brand: "spacex" },
  { term: "zia", title: "Zia", brand: "zia" },
  { term: "xbox", title: "Xbox", brand: "xbox" },
  { term: "microsoft", title: "Microsoft", brand: "microsoft" },
  { term: "ms", title: "Microsoft", brand: "microsoft" },
  { term: "me", title: "Me", brand: "me" },
];

export class ReservedError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function getKv(): Promise<MeshKv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as { MESH_KV?: MeshKv }).MESH_KV ?? null;
  } catch {
    return null;
  }
}

export function normalizeTerm(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/\.grid$/i, "")
    .replace(/^grid:\/\//i, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
  if (s.length < 1 || s.length > 32) return null;
  if (!/^[a-z][a-z0-9_-]*$/.test(s)) return null;
  return s;
}

function emptyStore(): StoreFile {
  const now = new Date().toISOString();
  const byTerm: Record<string, ReservedTerm> = {};
  for (const r of SYSTEM_RESERVED) {
    byTerm[r.term] = {
      term: r.term,
      title: r.title,
      brand: r.brand,
      source: "system",
      note: "Built-in system label",
      createdAt: now,
      updatedAt: now,
    };
  }
  for (const r of BRAND_RESERVED) {
    byTerm[r.term] = {
      term: r.term,
      title: r.title,
      brand: r.brand,
      source: "brand",
      note: "Built-in brand / logo realm",
      createdAt: now,
      updatedAt: now,
    };
  }
  return { updatedAt: now, byTerm };
}

function scrub(t: ReservedTerm): ReservedTerm | null {
  const term = normalizeTerm(t.term);
  if (!term) return null;
  const source: ReservedSource =
    t.source === "system" || t.source === "brand" || t.source === "admin"
      ? t.source
      : "admin";
  const title =
    typeof t.title === "string" && t.title.trim()
      ? t.title.trim().slice(0, 64)
      : term.charAt(0).toUpperCase() + term.slice(1);
  const brand =
    typeof t.brand === "string" && t.brand.trim()
      ? t.brand
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "")
          .slice(0, 32)
      : undefined;
  const note =
    typeof t.note === "string" && t.note.trim()
      ? t.note.trim().slice(0, 200)
      : undefined;
  return {
    term,
    title,
    brand: brand || undefined,
    note,
    source,
    createdAt: String(t.createdAt ?? new Date().toISOString()).slice(0, 40),
    updatedAt: String(t.updatedAt ?? new Date().toISOString()).slice(0, 40),
  };
}

function ensureSystem(store: StoreFile): void {
  const now = new Date().toISOString();
  for (const r of SYSTEM_RESERVED) {
    if (!store.byTerm[r.term]) {
      store.byTerm[r.term] = {
        term: r.term,
        title: r.title,
        brand: r.brand,
        source: "system",
        note: "Built-in system label",
        createdAt: now,
        updatedAt: now,
      };
    } else {
      // system always wins source flag
      store.byTerm[r.term] = {
        ...store.byTerm[r.term],
        source: "system",
        title: store.byTerm[r.term].title || r.title,
      };
    }
  }
}

async function loadStore(): Promise<{ store: StoreFile; kv: MeshKv | null }> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(KV_KEY, "text");
    if (raw && raw.length <= MAX_STORE_BYTES) {
      try {
        const parsed = JSON.parse(raw) as StoreFile;
        const store: StoreFile = {
          updatedAt:
            typeof parsed.updatedAt === "string"
              ? parsed.updatedAt.slice(0, 40)
              : new Date().toISOString(),
          byTerm: {},
        };
        for (const t of Object.values(parsed.byTerm ?? {})) {
          const s = scrub(t);
          if (s) store.byTerm[s.term] = s;
        }
        // First deploy: seed brands if store was empty-ish (only system from partial)
        if (Object.keys(store.byTerm).length === 0) {
          return { store: emptyStore(), kv };
        }
        ensureSystem(store);
        // Seed brands only if none of the brand seeds exist yet (fresh custom store)
        const hasAnyBrand = BRAND_RESERVED.some((b) => store.byTerm[b.term]);
        if (!hasAnyBrand) {
          const now = new Date().toISOString();
          for (const r of BRAND_RESERVED) {
            store.byTerm[r.term] = {
              term: r.term,
              title: r.title,
              brand: r.brand,
              source: "brand",
              note: "Built-in brand / logo realm",
              createdAt: now,
              updatedAt: now,
            };
          }
        }
        return { store, kv };
      } catch {
        /* fallthrough */
      }
    }
    return { store: emptyStore(), kv };
  }

  if (fsMemory) {
    ensureSystem(fsMemory);
    return { store: fsMemory, kv: null };
  }
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "reserved-terms.json");
    const raw = await fs.readFile(p, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    const store: StoreFile = {
      updatedAt: new Date().toISOString(),
      byTerm: {},
    };
    for (const t of Object.values(parsed.byTerm ?? {})) {
      const s = scrub(t);
      if (s) store.byTerm[s.term] = s;
    }
    if (Object.keys(store.byTerm).length === 0) {
      fsMemory = emptyStore();
    } else {
      ensureSystem(store);
      fsMemory = store;
    }
    return { store: fsMemory, kv: null };
  } catch {
    fsMemory = emptyStore();
    return { store: fsMemory, kv: null };
  }
}

function kvWriteErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  const lower = msg.toLowerCase();
  if (
    lower.includes("10048") ||
    lower.includes("free usage limit") ||
    lower.includes("limit for this operation") ||
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("quota")
  ) {
    return "Reserved-terms storage write limit reached for today (Cloudflare free tier). Try again after UTC midnight.";
  }
  return msg
    ? `Reserved-terms save failed: ${msg.slice(0, 180)}`
    : "Reserved-terms save failed";
}

async function saveStore(store: StoreFile, kv: MeshKv | null): Promise<void> {
  store.updatedAt = new Date().toISOString();
  const payload = JSON.stringify(store);
  if (payload.length > MAX_STORE_BYTES) {
    throw new ReservedError(413, "Reserved store too large");
  }
  if (kv) {
    try {
      await kv.put(KV_KEY, payload);
      return;
    } catch (e) {
      console.error("[reserved-store] MESH_KV.put failed", e);
      throw new ReservedError(503, kvWriteErrorMessage(e));
    }
  }
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "data");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "reserved-terms.json"), payload, "utf8");
    fsMemory = store;
  } catch (e) {
    console.error("[reserved-store] fs write failed", e);
    throw new ReservedError(500, "Failed to persist reserved terms");
  }
}

function sorted(terms: ReservedTerm[]): ReservedTerm[] {
  return [...terms].sort((a, b) => a.term.localeCompare(b.term));
}

/** Public + admin: full reserved list. */
export async function listReservedTerms(): Promise<{
  terms: ReservedTerm[];
  updatedAt: string;
  stats: { total: number; system: number; brand: number; admin: number };
}> {
  const { store } = await loadStore();
  const terms = sorted(Object.values(store.byTerm));
  const stats = {
    total: terms.length,
    system: terms.filter((t) => t.source === "system").length,
    brand: terms.filter((t) => t.source === "brand").length,
    admin: terms.filter((t) => t.source === "admin").length,
  };
  return { terms, updatedAt: store.updatedAt, stats };
}

export async function isTermReserved(raw: string): Promise<boolean> {
  const term = normalizeTerm(raw);
  if (!term) return false;
  const { store } = await loadStore();
  return !!store.byTerm[term];
}

export async function getReservedTerm(
  raw: string,
): Promise<ReservedTerm | null> {
  const term = normalizeTerm(raw);
  if (!term) return null;
  const { store } = await loadStore();
  return store.byTerm[term] ?? null;
}

/** Admin: reserve a new term (or update note/title on existing non-system). */
export async function reserveTerm(input: {
  term: string;
  title?: string;
  brand?: string;
  note?: string;
}): Promise<ReservedTerm> {
  const term = normalizeTerm(input.term);
  if (!term) {
    throw new ReservedError(
      400,
      "Invalid term (1–32 chars, start with a letter, a-z 0-9 _ -)",
    );
  }
  const { store, kv } = await loadStore();
  if (Object.keys(store.byTerm).length >= MAX_TERMS) {
    throw new ReservedError(400, `Reserved list full (max ${MAX_TERMS})`);
  }

  const existing = store.byTerm[term];
  if (existing?.source === "system") {
    throw new ReservedError(
      409,
      `«${term}» is a system reserved label and cannot be edited`,
    );
  }

  const now = new Date().toISOString();
  const title =
    (input.title && input.title.trim().slice(0, 64)) ||
    existing?.title ||
    term.charAt(0).toUpperCase() + term.slice(1);
  const brandRaw =
    input.brand !== undefined
      ? String(input.brand)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "")
          .slice(0, 32)
      : existing?.brand;
  const note =
    input.note !== undefined
      ? String(input.note).trim().slice(0, 200) || undefined
      : existing?.note;

  const rec: ReservedTerm = {
    term,
    title,
    brand: brandRaw || undefined,
    note,
    source: existing?.source === "brand" ? "brand" : "admin",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  store.byTerm[term] = rec;
  await saveStore(store, kv);
  return rec;
}

/** Admin: unreserve a term. System labels cannot be removed. */
export async function unreserveTerm(raw: string): Promise<{ term: string }> {
  const term = normalizeTerm(raw);
  if (!term) throw new ReservedError(400, "Invalid term");
  const { store, kv } = await loadStore();
  const existing = store.byTerm[term];
  if (!existing) throw new ReservedError(404, `«${term}» is not reserved`);
  if (existing.source === "system") {
    throw new ReservedError(
      403,
      `«${term}» is a system reserved label and cannot be removed`,
    );
  }
  delete store.byTerm[term];
  await saveStore(store, kv);
  return { term };
}
