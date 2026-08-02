import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import Link from "next/link";
import {
  H1,
  H2,
  Lead,
  Note,
  P,
  Table,
  Ul,
} from "@/components/docs/DocsChrome";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { API_BASE } from "@/lib/docs-nav";

export const metadata: Metadata = metadataFor("/docs");

export default function DocsHomePage() {
  return (
    <>
      <H1>GRID network documentation</H1>
      <Lead>
        Operate a peer, mine verified work, inspect signed blocks, manage wallets,
        or build against the public data plane. These docs describe the running
        pilot and clearly separate it from the longer-term white-paper vision.
      </Lead>

      <Note>
        <strong className="text-foreground">Current status:</strong> public
        Genesis-led pilot with P2P block verification. Permissionless block
        production and decentralized finality are not yet live.
        <br />
        <strong className="text-foreground">Public API:</strong>{" "}
        <code className="font-mono text-foreground">{API_BASE}</code>
      </Note>

      <H2 id="what-you-get">Start with the system you need</H2>
      <Ul>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/network">
            Network architecture
          </Link>{" "}
          — Genesis, coordinator, P2P peers, blocks, and trust boundaries
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/getting-started">
            Run a node
          </Link>{" "}
          — install GRID 0.2.27, initialize keys, join P2P, and mine
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/por">
            Proof of Resource
          </Link>{" "}
          — verified contribution, scoring, allocation, and settlement
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/explorer">
            Explorer API
          </Link>{" "}
          — chain health, blocks, settlements, capacity, and peers
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/wallets">
            Phoenix · GRID Wallet
          </Link>{" "}
          — native GRID addresses and Solana devnet reward addresses
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/registry">
            Registry and compute APIs
          </Link>{" "}
          — names, public capacity, identity, and privacy-preserving pings
        </li>
      </Ul>

      <H2 id="quick-start">Live network snapshot</H2>
      <CodeBlock
        lang="bash"
        title="curl"
        code={`curl -fsS ${API_BASE}/api/explorer \\
  | jq '{checkedAt, health, chain: .chain | {chainId, height, tipHash}, rewards: .coordinator.rewards}'

curl -fsS ${API_BASE}/api/mesh \\
  | jq '{stats, genesis, peers}'`}
      />

      <H2 id="surface">Public surface map</H2>
      <Table
        headers={["Area", "Read", "Write", "Contains"]}
        rows={[
          [
            "Network Explorer",
            "GET /api/explorer",
            "—",
            "Genesis health, blocks, settlements, rewards, mesh",
          ],
          [
            "Registry directory",
            "GET /api/registry",
            "—",
            "Paid active names, node/compute roles, capacity stats",
          ],
          [
            "Mesh / globe",
            "GET /api/mesh",
            "POST /api/mesh/ping",
            "Coarse lat/lng, class, region — never IPs",
          ],
          [
            "Computes",
            "GET /api/registry/computes",
            "POST /api/registry/computes",
            "Slots, image labels, availability — no dial endpoints",
          ],
          [
            "Name registration",
            "GET /api/registry/register",
            "POST /api/registry/register",
            "Name lifecycle + Cash App payment notes",
          ],
          [
            "Identity badges",
            "GET /api/registry/entity",
            "POST /api/registry/entity",
            "Key / Verified public badges + optional cert JSON",
          ],
        ]}
      />

      <H2 id="hard-rules">Hard rules (read this)</H2>
      <P>
        Public visibility is deliberately narrower than internal network state:
      </P>
      <Ul>
        <li>
          <strong className="text-foreground">No IPs, ports, hostnames, or tunnels</strong>{" "}
          in public registry/mesh JSON.
        </li>
        <li>
          <strong className="text-foreground">No private keys, vault material, or seed phrases</strong>{" "}
          — ever returned by these endpoints.
        </li>
        <li>
          <strong className="text-foreground">No payment rails except the public Cash App cashtag</strong>{" "}
          used for name activation fees.
        </li>
        <li>
          <strong className="text-foreground">Mesh pings are location-only</strong>{" "}
          and quantized for the map. They do not prove capacity or publish dial
          targets.
        </li>
        <li>
          <strong className="text-foreground">Registry listing requires activation</strong>{" "}
          plus human review. A globe ping alone does not list you.
        </li>
        <li>
          <strong className="text-foreground">Pilot rewards are test accounting</strong>{" "}
          and are not guaranteed income, market value, or an exchange listing.
        </li>
      </Ul>

      <P>
        Next:{" "}
        <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/getting-started">
          Getting started
        </Link>{" "}
        or read the{" "}
        <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/network">
          network architecture
        </Link>
        .
      </P>
    </>
  );
}
