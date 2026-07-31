import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  Endpoint,
  H1,
  H2,
  Lead,
  Note,
  P,
  Table,
} from "@/components/docs/DocsChrome";

export const metadata: Metadata = metadataFor("/docs/explorer");

export default function ExplorerDocsPage() {
  return (
    <>
      <H1>Explorer API</H1>
      <Lead>
        One read-only response combines Genesis chain state, coordinator status,
        settlements, and privacy-preserving mesh telemetry. The browser Explorer
        uses this same public data.
      </Lead>

      <Endpoint method="GET" path="/api/explorer">
        Uncached public snapshot. Sends{" "}
        <code className="font-mono">Access-Control-Allow-Origin: *</code>.
      </Endpoint>

      <CodeBlock
        lang="bash"
        code={`curl -fsS https://grid-compute.com/api/explorer \\
  | jq '{checkedAt, health, endpoints, chain, coordinator, settlement}'`}
      />

      <H2 id="shape">Top-level response</H2>
      <Table
        headers={["Field", "Meaning"]}
        rows={[
          ["checkedAt", "Time the edge assembled this response"],
          ["endpoints", "Canonical public Genesis, coordinator, P2P, and mesh addresses"],
          ["health", "Reachability booleans for Genesis, coordinator, and mesh"],
          ["genesis", "Public Genesis role, policy, epoch, and chain summary"],
          ["chain", "Chain ID, height, leader key, tip, and recent block details"],
          ["coordinator", "Job, node, reward, cap, and issued-reward statistics"],
          ["status", "Coordinator service status"],
          ["settlement", "Coordinator-to-chain inclusion counters"],
          ["mesh", "Coarse node presence snapshot; no public IP addresses"],
        ]}
      />

      <H2 id="blocks">Block details</H2>
      <CodeBlock
        lang="json"
        title="chain.blocks[]"
        code={`{
  "height": 1,
  "hash": "b4a948…f609a",
  "previousHash": "527314…741a",
  "stateRoot": "c1002b…4c20",
  "timestamp": "2026-07-28T23:00:45.136249856+00:00",
  "transactions": 23,
  "settlements": 23
}`}
      />
      <P>
        Hashes are abbreviated only in this documentation example. The API and
        Explorer expose the complete values. The browser allows a block row to be
        expanded to show its previous hash, state root, timestamp, transaction
        count, and settlement count.
      </P>

      <H2 id="polling">Polling</H2>
      <P>
        The public Explorer UI refreshes automatically once per hour and also
        provides manual refresh. API clients should use similarly conservative
        polling and honor HTTP failures with exponential backoff.
      </P>

      <Note>
        A healthy edge response does not mean every upstream is healthy. Always
        inspect the <code className="font-mono">health</code> object and treat
        individual upstream sections as nullable.
      </Note>

      <H2 id="links">Public surfaces</H2>
      <Table
        headers={["Surface", "URL"]}
        rows={[
          ["Visual Explorer", "https://explorer.grid-compute.com"],
          ["Explorer JSON", "https://grid-compute.com/api/explorer"],
          ["Mesh JSON", "https://grid-compute.com/api/mesh"],
          ["Genesis health", "https://genesis.grid-compute.com/health"],
          ["Coordinator health", "https://coordinator.grid-compute.com/health"],
        ]}
      />
    </>
  );
}
