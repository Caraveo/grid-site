import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  Endpoint,
  H1,
  H2,
  Lead,
  Note,
  P,
  Table,
  Ul,
} from "@/components/docs/DocsChrome";
import { API_BASE } from "@/lib/docs-nav";

export const metadata = {
  title: "Nodes & mesh",
  description:
    "Public mesh peers and location-only globe pings for GRID nodes.",
};

export default function NodesDocsPage() {
  return (
    <>
      <H1>Nodes & mesh</H1>
      <Lead>
        Presence data for the public globe. Coordinates are coarse and
        opt-in. This plane never carries operator IPs, listen ports, or tunnel
        URLs.
      </Lead>

      <Endpoint method="GET" path="/api/mesh">
        Public peer list + genesis pin. Alias-style surface for globe UIs.
      </Endpoint>
      <CodeBlock
        lang="bash"
        code={`curl -sS ${API_BASE}/api/mesh | jq '{phase, stats, peers: .peers[:5]}'`}
      />
      <CodeBlock
        lang="json"
        title="peer object"
        code={`{
  "id": "node_macmini",
  "label": "MacNode",
  "class": "S",
  "region": "NA-W",
  "status": "online",
  "role": "peer",
  "joinedAt": "2026-07-17T17:04:12.138Z",
  "lastSeen": "2026-07-18T04:14:57.178Z",
  "lat": 37.5,
  "lng": -122.5
}`}
      />

      <H2 id="ping">Mesh ping (write)</H2>
      <Endpoint method="POST" path="/api/mesh/ping">
        Location-only heartbeat. Requires webhook auth in production. Body is
        allowlisted — nested objects and banned keys are dropped.
      </Endpoint>
      <Endpoint method="GET" path="/api/mesh/ping">
        Machine-readable schema: accepted fields, filters, auth header name.
      </Endpoint>

      <H2 id="body">POST body</H2>
      <Table
        headers={["Field", "Required", "Notes"]}
        rows={[
          ["nodeId", "yes", "[a-zA-Z0-9_-]{2,64}"],
          ["lat / lng", "yes", "WGS84 floats (quantized server-side)"],
          ["label", "no", "Alnum + limited punctuation; no HTML"],
          ["class", "no", "S | M | L"],
          ["region", "no", "A-Z0-9_- only"],
          ["status", "no", "online | syncing | idle | offline"],
        ]}
      />
      <CodeBlock
        lang="bash"
        code={`curl -sS -X POST ${API_BASE}/api/mesh/ping \\
  -H 'content-type: application/json' \\
  -H "authorization: Bearer $GRID_WEBHOOK_SECRET" \\
  -d '{
    "nodeId": "node_a1b2c3d4",
    "label": "garage",
    "class": "S",
    "region": "NA-W",
    "status": "online",
    "lat": 37.7,
    "lng": -122.4
  }'`}
      />

      <H2 id="filters">Server filters</H2>
      <Ul>
        <li>Allowlist keys only</li>
        <li>Max body ~4 KB</li>
        <li>No IPs, hostnames, nested objects</li>
        <li>Label sanitized against HTML/script patterns</li>
      </Ul>

      <Note>
        A successful ping does <strong className="text-foreground">not</strong>{" "}
        register a name on registry.grid. Listing requires paid activation.
        Globe coordinates should be operator-configured — never reverse-DNS or
        IP-geolocate silently.
      </Note>

      <H2 id="cli">CLI</H2>
      <P>
        When <code className="font-mono">~/.grid/env</code> has{" "}
        <code className="font-mono">GRID_WEBHOOK_SECRET</code> and globe
        lat/lng, the node may fire-and-forget pings on start / heartbeat.
      </P>
      <CodeBlock
        lang="bash"
        code={`# ~/.grid/env (operator machine only)
GRID_SITE_URL=https://grid-compute.com
GRID_WEBHOOK_SECRET=…   # same secret as Worker
GRID_GLOBE_LAT=37.7
GRID_GLOBE_LNG=-122.4
GRID_GLOBE_REGION=NA-W`}
      />
    </>
  );
}
