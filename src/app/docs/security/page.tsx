import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { H1, H2, Lead, Note, P, Table, Ul } from "@/components/docs/DocsChrome";

export const metadata: Metadata = metadataFor("/docs/security");

export default function SecurityDocsPage() {
  return (
    <>
      <H1>Data & safety</H1>
      <Lead>
        The public API is a deliberate subset of network truth. Anything that
        could harm operators, users, or the integrity of the security layer is
        kept off this surface.
      </Lead>

      <H2 id="public">Always public (safe)</H2>
      <Ul>
        <li>Chain ID, height, block hashes, state roots, and leader public key</li>
        <li>Verified settlement counts and aggregate reward statistics</li>
        <li>Activated names and their kinds (node / compute)</li>
        <li>Capacity ads: free slots, status, image labels, class, region</li>
        <li>Coarse globe coordinates (opt-in)</li>
        <li>Public identity badges and cert payloads meant for verification</li>
        <li>Registry CA <em>public</em> key</li>
        <li>Cash App cashtag used for activation fees</li>
      </Ul>

      <H2 id="never">Never public</H2>
      <Table
        headers={["Data", "Why"]}
        rows={[
          ["IPv4/IPv6, ports, hostnames", "Enables scanning, DDoS, and doxxing"],
          ["Cloudflare tunnel / reverse-proxy URLs", "Bypasses operator intent"],
          ["Operator private keys / vault DEKs", "Full account takeover"],
          ["CA private seed", "Forge network certificates"],
          ["Capacity/admin service secrets", "Spam capacity or mutate protected services"],
          ["Node heartbeat private keys", "Forge that node's public-presence signature"],
          ["Raw MAC / forensic dumps", "Compliance-sensitive; not a public signal"],
          ["Bitcoin wallet mnemonics or WIF", "Theft of funds"],
          ["GRID recovery phrases / wallet encryption material", "Wallet takeover"],
          ["Solana reward keypair JSON", "Control of the devnet reward address"],
          ["Genesis signing and recovery private keys", "Forge network authority"],
          ["Unreviewed registration PII", "Abuse and spam targeting"],
        ]}
      />

      <H2 id="client">Client responsibilities</H2>
      <Ul>
        <li>Pin HTTPS to grid-compute.com (or document mirrors carefully)</li>
        <li>Treat registry JSON as untrusted input — validate types/ranges</li>
        <li>Do not log webhook secrets</li>
        <li>Show humans <code className="font-mono">grid://name.grid</code>, not internal locators</li>
        <li>Rate-limit your own pollers; the network is shared</li>
      </Ul>

      <H2 id="integrity">Integrity tips</H2>
      <P>
        When a realm presents a permanent cert, verify the signature against{" "}
        <code className="font-mono">GET /api/registry/entity?ca=1</code>. If
        verification fails, ignore the badge. Revoked or inactive statuses must
        clear any elevated trust UI.
      </P>

      <H2 id="chain">Chain verification boundary</H2>
      <Ul>
        <li>Trust the configured Genesis public key, never a key supplied by an untrusted peer.</li>
        <li>Verify each block signature, previous hash, state root, and chain ID.</li>
        <li>Replay settlement allocation from committed inputs.</li>
        <li>Reject stale signed-truth epochs and peers on a verified ban list.</li>
        <li>Do not describe Genesis-led production as decentralized finality.</li>
      </Ul>

      <H2 id="heartbeat">Heartbeat integrity</H2>
      <Ul>
        <li>Each node signs public-presence data with a dedicated Ed25519 key.</li>
        <li>The node id is derived from the public key; arbitrary ids cannot be claimed.</li>
        <li>Timestamps have a five-minute acceptance window.</li>
        <li>Random nonces are stored atomically per node and cannot be replayed.</li>
        <li>Map coordinates are rounded to 0.5° before public KV storage.</li>
        <li>No shared public mesh secret is distributed to node operators.</li>
      </Ul>

      <H2 id="wallet">Wallet safety</H2>
      <P>
        The website never needs a recovery phrase. Phoenix and the CLI keep wallet
        material on the operator&apos;s machine. The Solana reward key at{" "}
        <code className="font-mono">~/.grid/keys/solana-reward.json</code> is
        created with restrictive permissions and is never overwritten by{" "}
        <code className="font-mono">grid solana create</code>.
      </P>

      <Note>
        If you believe you found a data leak in a public endpoint (IP, key
        material, etc.), stop using the field and report responsibly via the
        project GitHub security contacts. Do not weaponize it.
      </Note>
    </>
  );
}
