import assert from "node:assert/strict";
import test from "node:test";
import nacl from "tweetnacl";
import {
  canonicalHeartbeat,
  nodeIdForPublicKey,
  parseHeartbeat,
  verifyHeartbeatSignature,
  type SignedHeartbeatV1,
} from "./protocol.ts";

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function signedFixture(): SignedHeartbeatV1 {
  const keys = nacl.sign.keyPair.fromSeed(new Uint8Array(32).fill(7));
  const unsigned: SignedHeartbeatV1 = {
    version: 1,
    publicKey: hex(keys.publicKey),
    issuedAtMs: 1_783_000_000_000,
    nonce: "ab".repeat(16),
    label: "Caraveo Intel",
    class: "S",
    region: "NA-W",
    status: "online",
    latE4: 400_150,
    lngE4: -1_055_000,
    signature: "00".repeat(64),
  };
  unsigned.signature = hex(
    nacl.sign.detached(canonicalHeartbeat(unsigned), keys.secretKey),
  );
  return unsigned;
}

test("accepts a valid Ed25519 heartbeat", async () => {
  const heartbeat = parseHeartbeat(signedFixture());
  assert.equal(await verifyHeartbeatSignature(heartbeat), true);
});

test("rejects tampering after signing", async () => {
  const heartbeat = signedFixture();
  heartbeat.region = "EU";
  assert.equal(await verifyHeartbeatSignature(heartbeat), false);
});

test("rejects unknown and sensitive fields", () => {
  assert.throws(
    () => parseHeartbeat({ ...signedFixture(), wallet: "do-not-store" }),
    /unsupported field/,
  );
});

test("derives a stable non-secret node id from the public key", async () => {
  const heartbeat = signedFixture();
  const first = await nodeIdForPublicKey(heartbeat.publicKey);
  const second = await nodeIdForPublicKey(heartbeat.publicKey);
  assert.match(first, /^node_[0-9a-f]{48}$/);
  assert.equal(first, second);
});
