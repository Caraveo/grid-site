/**
 * GRID Protocol identity helpers (mirror of GProc crate).
 *
 * gp_id is computed by the CLI (blake3 XOF-64). The site stores and validates
 * the 128-hex form — it does not re-derive without a blake3 dependency.
 *
 * Machine / IP / MAC are never part of gp_id. Never expose gp:// on public pages.
 */

export const GP_ID_DOMAIN = "GRID-GP-v1";
export const GP_ID_HEX_LEN = 128;

export const KEY_FEE_USD = 300;
export const VERIFIED_ENTITY_FEE_USD = 10_000;

export type CertTier = "key" | "verified";

export function feeForTier(tier: CertTier): number {
  return tier === "verified" ? VERIFIED_ENTITY_FEE_USD : KEY_FEE_USD;
}

export function normalizeRealm(raw: string): string | null {
  let s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  if (s.startsWith("grid://")) s = s.slice("grid://".length);
  else if (s.startsWith("grid:")) s = s.replace(/^grid:\/?/, "");
  const pathCut = s.indexOf("/");
  if (pathCut >= 0) s = s.slice(0, pathCut);
  const qCut = s.indexOf("?");
  if (qCut >= 0) s = s.slice(0, qCut);
  if (s.endsWith(".grid")) s = s.slice(0, -".grid".length);
  s = s.replace(/[^a-z0-9_-]/g, "");
  if (s.length < 2 || s.length > 32) return null;
  return s;
}

/** Validate 128 lowercase hex */
export function isValidGpIdHex(s: string): boolean {
  return (
    typeof s === "string" &&
    s.length === GP_ID_HEX_LEN &&
    /^[0-9a-f]+$/.test(s)
  );
}

/** Public-safe badge fields only (no gp wire form). */
export function publicBadge(tier: CertTier | null | undefined): {
  key: boolean;
  verified: boolean;
} {
  return {
    key: tier === "key" || tier === "verified",
    verified: tier === "verified",
  };
}
