import nacl from "tweetnacl";
import { ensureSystemRealmCertificate } from "./entity-store";
import { certCanonicalBody, type GpCertificate } from "./gp-ca";

export type RealmManifest = {
  version: 1;
  realm: "grid";
  origin: "https://grid-compute.com";
  issuedAt: string;
  notAfter: string;
  certificate: GpCertificate;
  signature: string;
};

function realmSeed(): Uint8Array | null {
  const raw = String(process.env.GRID_SYSTEM_REALM_SEED ?? "")
    .trim()
    .toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(raw)) return null;
  const bytes = new Uint8Array(raw.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(raw.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function realmManifestCanonicalBody(
  manifest: Omit<RealmManifest, "signature">,
): string {
  return [
    "GRID-REALM-MANIFEST-v1",
    String(manifest.version),
    manifest.realm,
    manifest.origin,
    manifest.issuedAt,
    manifest.notAfter,
    certCanonicalBody(manifest.certificate),
  ].join("\n");
}

export async function systemRealmManifest(): Promise<RealmManifest | null> {
  const seed = realmSeed();
  const system = await ensureSystemRealmCertificate();
  if (!seed || !system) return null;

  const unsigned = {
    version: 1 as const,
    realm: "grid" as const,
    origin: "https://grid-compute.com" as const,
    issuedAt: new Date().toISOString(),
    notAfter: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    certificate: system.cert as GpCertificate,
  };
  const signature = nacl.sign.detached(
    new TextEncoder().encode(realmManifestCanonicalBody(unsigned)),
    nacl.sign.keyPair.fromSeed(seed).secretKey,
  );
  return { ...unsigned, signature: bytesToHex(signature) };
}

export async function systemRealmWire(): Promise<string | null> {
  const manifest = await systemRealmManifest();
  if (!manifest) return null;

  const certificate = manifest.certificate;
  return [
    "GRID-REALM-WIRE-v1",
    `version=${manifest.version}`,
    `realm=${manifest.realm}`,
    `origin=${manifest.origin}`,
    `issuedAt=${manifest.issuedAt}`,
    `notAfter=${manifest.notAfter}`,
    `certificate.version=${certificate.version}`,
    `certificate.gpId=${certificate.gpId}`,
    `certificate.realm=${certificate.realm}`,
    `certificate.pubkeyHex=${certificate.pubkeyHex}`,
    `certificate.tier=${certificate.tier}`,
    `certificate.entityName=${certificate.entityName ?? ""}`,
    `certificate.issuedAt=${certificate.issuedAt}`,
    `certificate.notAfter=${certificate.notAfter}`,
    `certificate.paymentRef=${certificate.paymentRef ?? ""}`,
    `certificate.caSignature=${certificate.caSignature}`,
    `certificate.caPubkeyHex=${certificate.caPubkeyHex}`,
    `signature=${manifest.signature}`,
    "",
  ].join("\n");
}
