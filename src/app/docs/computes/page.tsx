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

export const metadata = {
  title: "Computes API",
  description:
    "Public compute capacity registry — free slots, status, no host endpoints.",
};

export default function ComputesDocsPage() {
  return (
    <>
      <H1>Computes API</H1>
      <Lead>
        Discover available capacity across the network. Public responses
        describe <em>what</em> is free — never <em>where to open a socket</em>.
      </Lead>

      <Endpoint method="GET" path="/api/registry/computes">
        Full compute directory. Query filters supported.
      </Endpoint>

      <H2 id="query">Query parameters</H2>
      <Table
        headers={["Param", "Values", "Effect"]}
        rows={[
          ["available", "1 | true", "Only computes with free capacity / fresh heartbeat"],
          ["visibility", "public | private | all", "Filter by advertised visibility (default all)"],
        ]}
      />
      <CodeBlock
        lang="bash"
        code={`# Anything free right now?
curl -sS '${API_BASE}/api/registry/computes?available=1' | jq '.stats, .computes'

# Public visibility only
curl -sS '${API_BASE}/api/registry/computes?visibility=public' | jq '.computes[].name'`}
      />

      <H2 id="row">Compute row fields</H2>
      <Table
        headers={["Field", "Meaning"]}
        rows={[
          ["id", "Stable row id (nodeId:name)"],
          ["name", "Public compute name (must be activated to list on registry.grid)"],
          ["nodeId", "Opaque operator node identifier"],
          ["image", "Image / workload label (e.g. nginx:alpine) — not a private registry secret"],
          ["visibility", "public or private"],
          ["class", "S | M | L"],
          ["backend", "e.g. docker"],
          ["replicas", "Configured replica count"],
          ["freeSlots", "Currently free units of work"],
          ["status", "available | busy | offline (heartbeat-derived)"],
          ["lastSeen", "Last announce / heartbeat"],
        ]}
      />
      <CodeBlock
        lang="json"
        title="example row"
        code={`{
  "id": "node_macmini:fire",
  "name": "fire",
  "nodeId": "node_macmini",
  "label": "Fire - Spark of Technology",
  "image": "nginx:alpine",
  "visibility": "public",
  "class": "S",
  "backend": "docker",
  "replicas": 4,
  "freeSlots": 4,
  "status": "offline",
  "lastSeen": "2026-07-18T04:18:11.799Z",
  "firstSeen": "2026-07-18T00:12:51.647Z"
}`}
      />

      <H2 id="announce">Announce / heartbeat (write)</H2>
      <Endpoint method="POST" path="/api/registry/computes">
        Host announce. Requires webhook bearer in production. Body includes
        nodeId + computes[].
      </Endpoint>
      <CodeBlock
        lang="bash"
        code={`curl -sS -X POST ${API_BASE}/api/registry/computes \\
  -H 'content-type: application/json' \\
  -H "authorization: Bearer $GRID_WEBHOOK_SECRET" \\
  -d '{
    "nodeId": "node_macmini",
    "label": "MacNode",
    "computes": [{
      "name": "fire",
      "image": "nginx:alpine",
      "visibility": "public",
      "class": "S",
      "backend": "docker",
      "replicas": 4,
      "freeSlots": 3
    }]
  }'`}
      />

      <Note>
        Heartbeat freshness defines availability (see{" "}
        <code className="font-mono">availableMs</code> in the GET response).
        Stale rows flip to offline. The CLI{" "}
        <code className="font-mono">grid ember</code> path performs announces
        for you when a name is activated.
      </Note>

      <H2 id="builder-pattern">Builder pattern</H2>
      <P>
        Poll available computes, rank by freeSlots / class / region, then
        negotiate work through your application protocol. Do not treat image
        labels as pull credentials or assume public Docker Hub access equals
        permission to run jobs on a peer.
      </P>
    </>
  );
}
