import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { ArchitectureDiagram } from "@/components/docs/ArchitectureDiagram";
import {
  H1,
  H2,
  H3,
  Lead,
  Note,
  P,
  Table,
  Ul,
} from "@/components/docs/DocsChrome";

export const metadata: Metadata = metadataFor("/docs/network");

export default function NetworkDocsPage() {
  return (
    <>
      <H1>Network architecture & status</H1>
      <Lead>
        GRID currently runs as a public pilot: one Genesis authority produces
        signed blocks, independent peers verify and replicate them, the coordinator
        assigns useful work, and public APIs expose privacy-preserving telemetry.
      </Lead>

      <Note>
        <strong className="text-foreground">Consensus boundary:</strong> block
        production is Genesis-led today. P2P verification is live, but permissionless
        block production and decentralized finality are not yet implemented.
      </Note>

      <H2 id="overview">Architecture overview</H2>
      <ArchitectureDiagram />
      <P>
        Contributors should preserve these boundaries: wallets own custody and
        signing, the ARK edge accepts signed envelopes, GRID core owns validation
        and replay protection, and Genesis currently anchors canonical Phase 1
        state. A service may relay data across a boundary; it must not silently
        absorb the responsibility on the other side.
      </P>

      <H2 id="topology">Public topology</H2>
      <Table
        headers={["Component", "Public address", "Responsibility"]}
        rows={[
          [
            "Genesis truth",
            "https://genesis.grid-compute.com",
            "Signed network truth, health, chain snapshots",
          ],
          [
            "Genesis P2P",
            "genesis.grid-compute.com:9900",
            "Default bootstrap peer, gossip, block replication",
          ],
          [
            "Coordinator",
            "https://coordinator.grid-compute.com",
            "Job claims, verification, receipts, reward status",
          ],
          [
            "Explorer",
            "https://explorer.grid-compute.com",
            "Blocks, settlements, capacity, peers, health",
          ],
          [
            "Public mesh",
            "https://grid-compute.com/api/mesh",
            "Coarse node presence without public IP addresses",
          ],
        ]}
      />

      <H2 id="flow">Work-to-block flow</H2>
      <CodeBlock
        lang="text"
        code={`miner / host
    │ claims authorized work
    ▼
coordinator ── verifies intent + result ──► settlement receipt
                                                  │
                                                  ▼
Genesis producer ── deterministic PoR allocation ──► signed block
                                                  │
                                                  ▼
P2P peers ── verify signature, chain link, state root, and allocation replay`}
      />
      <P>
        Coordinator reward amounts are not blindly trusted by replicas. A block
        carries the inputs required to replay its allocation. Peers reject invalid
        signatures, broken previous-hash links, unverified settlements, malformed
        commitments, or allocation mismatches.
      </P>

      <H2 id="trust">Trust anchors</H2>
      <Ul>
        <li>
          The canonical Genesis hostname is compiled into the current CLI as the
          default P2P bootstrap and truth endpoint.
        </li>
        <li>
          The current Genesis leader public key is a client trust anchor. Private
          signing and recovery keys are not published.
        </li>
        <li>
          Genesis truth snapshots are signed and use a monotonic epoch so peers can
          reject stale policy.
        </li>
        <li>
          Peer gossip can introduce additional peers; it cannot forge Genesis
          signatures or valid settlement blocks.
        </li>
      </Ul>

      <H2 id="peer">Join the P2P fabric</H2>
      <CodeBlock
        lang="bash"
        code={`# Initialize once
grid init --name garage --class S

# Genesis is dialed automatically
grid peer --name garage --with-bench

# Explicit extra peers may be added
grid peer --name garage --connect peer.example:9900`}
      />
      <P>
        The default listener is <code className="font-mono">0.0.0.0:9900</code>.
        Make that port reachable only if you intend to accept inbound peers. A
        node can still dial Genesis and participate behind ordinary outbound NAT.
        <code className="font-mono">grid peer</code> is the peer-only mode.
        Use <code className="font-mono">grid node</code> for the all-in-one
        process: encrypted P2P replication + host + mine.
      </P>

      <H2 id="heartbeat">Signed public presence</H2>
      <P>
        A location-enabled node creates a dedicated Ed25519 heartbeat identity
        with restrictive local permissions. Every pulse signs its timestamp,
        random nonce, coarse map coordinates, class, region, and status. The
        receiving Worker derives the public node id from the public key and uses
        one SQLite-backed Durable Object per node to reject replay atomically.
        Coordinates are rounded to 0.5° before public storage; IP addresses,
        ports, hostnames, wallets, and private keys are not stored.
      </P>
      <CodeBlock
        lang="bash"
        code={`export GRID_GLOBE_LAT=39.5      # use a coarse nearby-city location
export GRID_GLOBE_LNG=-105.0
export GRID_GLOBE_REGION=NA-W
grid node`}
      />

      <H2 id="mainnet-gate">Decentralized mainnet gate</H2>
      <CodeBlock
        lang="bash"
        code={`grid mainnet
grid mainnet --json

# One-time blocks.json migration; legacy file is retained read-only
grid mainnet --migrate-storage`}
      />
      <P>
        The gate is fail-closed. It remains red while Genesis is the only
        finalizing signer, fewer than four independent validators exist, quorum
        certificates are not enforced by block validation, treasury consensus
        state is absent, append-only block persistence is not active, or an external
        security review is outstanding. GRID has 3-of-4 validator-certificate
        verification primitives now; proposal, vote, finalization, leader-failover
        transport, and indexed storage remain the production milestone.
      </P>

      <H3 id="local">Local and custom networks</H3>
      <P>
        Development tools and Phoenix wallet settings may target a local or custom
        node. That is useful for testing, but it creates a different trust boundary.
        The public pilot defaults to the canonical Genesis endpoints above.
      </P>

      <H2 id="live">Read live status</H2>
      <CodeBlock
        lang="bash"
        code={`curl -fsS https://grid-compute.com/api/explorer \\
  | jq '{checkedAt, health, chain: .chain | {chainId, height, tipHash}}'

curl -fsS https://grid-compute.com/api/mesh \\
  | jq '{stats, genesis, peers}'`}
      />
    </>
  );
}
