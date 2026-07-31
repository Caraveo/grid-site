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
import { API_BASE } from "@/lib/docs-nav";

export const metadata: Metadata = metadataFor("/docs/registry");

export default function RegistryDocsPage() {
  return (
    <>
      <H1>Registry API</H1>
      <Lead>
        The canonical public directory. If a name is not{" "}
        <strong className="text-foreground">active</strong> here, Mesh and
        capacity tools should treat it as unlisted — even if something once
        pinged the globe.
      </Lead>

      <Endpoint method="GET" path="/api/registry">
        Full snapshot: paid entries, filtered nodes, computes, stats, and links.
        No authentication. CORS open.
      </Endpoint>

      <H2 id="example">Example</H2>
      <CodeBlock
        lang="bash"
        code={`curl -sS ${API_BASE}/api/registry \\
  -H 'accept: application/json' | jq .`}
      />

      <H2 id="shape">Response shape (abridged)</H2>
      <CodeBlock
        lang="json"
        title="json"
        code={`{
  "registry": "https://grid-compute.com",
  "phase": "1",
  "updatedAt": "2026-07-18T04:38:00.648Z",
  "rule": "Paid activation required before listing…",
  "entries": [
    {
      "name": "fire",
      "label": "Fire - Spark of Technology",
      "class": "S",
      "region": "NA-W",
      "kinds": ["node", "compute"],
      "nodeOnline": false,
      "computeOnline": false,
      "freeSlots": 4,
      "replicas": 4,
      "computeStatus": "offline",
      "image": "nginx:alpine",
      "registeredAt": "2026-07-18T00:01:08.595Z"
    }
  ],
  "nodes": [ /* online registered peers */ ],
  "computes": [ /* live capacity rows for active names */ ],
  "computeStats": {
    "total": 1,
    "available": 0,
    "busy": 0,
    "offline": 1,
    "freeSlots": 0
  },
  "stats": {
    "registered": 3,
    "registeredNodes": 3,
    "registeredComputes": 3,
    "onlineRegisteredNodes": 0,
    "availableRegisteredComputes": 0
  },
  "links": {
    "register": "https://grid-compute.com/registry",
    "computes": "https://grid-compute.com/api/registry/computes",
    "available": "https://grid-compute.com/api/registry/computes?available=1",
    "meshPing": "https://grid-compute.com/api/mesh/ping"
  }
}`}
      />

      <H2 id="fields">Important fields</H2>
      <Table
        headers={["Field", "Description"]}
        rows={[
          ["entries[]", "Every active paid name (node and/or compute kinds)"],
          ["entries[].kinds", "Roles the name registered for: node, compute"],
          ["entries[].freeSlots", "Advertised free capacity when a compute is known"],
          ["computes[]", "Live capacity rows (status, image label, slots)"],
          ["nodes[] / peers[]", "Presence rows for registered operators"],
          ["genesis", "Network origin pin for the globe"],
          ["rule", "Human-readable activation policy"],
        ]}
      />

      <H2 id="policy">Listing policy</H2>
      <P>
        Names appear only after Cash App payment of the activation fee (default
        $5 USD to <code className="font-mono">$Caraveo</code> with the exact
        registration note) and successful human review. That keeps spam off
        registry.grid and funds reviewers.
      </P>
      <Note>
        The registry is a <strong className="text-foreground">control-plane directory</strong>,
        not a packet router. Clients must not expect raw dial strings, private
        multiaddrs, or operator home IPs in this JSON.
      </Note>

      <H2 id="headers">Response headers</H2>
      <Table
        headers={["Header", "Value"]}
        rows={[
          ["Cache-Control", "no-store, max-age=0"],
          ["Access-Control-Allow-Origin", "*"],
          ["X-Grid-Registry", "https://grid-compute.com"],
        ]}
      />
    </>
  );
}
