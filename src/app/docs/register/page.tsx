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
  Ul,
} from "@/components/docs/DocsChrome";
import { API_BASE } from "@/lib/docs-nav";

export const metadata: Metadata = metadataFor("/docs/register");

export default function RegisterDocsPage() {
  return (
    <>
      <H1>Name registration</H1>
      <Lead>
        Activate a public name on registry.grid so Mesh, capacity ads, and the
        directory can list you. Fee is paid only via Cash App to{" "}
        <code className="font-mono text-foreground">$Caraveo</code>.
      </Lead>

      <Note>
        UI flow:{" "}
        <a
          className="text-foreground underline-offset-2 hover:underline"
          href={`${API_BASE}/registry`}
        >
          {API_BASE}/registry
        </a>
        . Same backend as the API below.
      </Note>

      <H2 id="read">Read</H2>
      <Endpoint method="GET" path="/api/registry/register">
        Directory + fee info when called with no query.
      </Endpoint>
      <Endpoint method="GET" path="/api/registry/register?name=garage">
        Availability check for a candidate name.
      </Endpoint>
      <Endpoint method="GET" path="/api/registry/register?id=reg_…">
        Status of a registration you started (id from POST).
      </Endpoint>
      <CodeBlock
        lang="bash"
        code={`# Fee + public directory
curl -sS ${API_BASE}/api/registry/register | jq '{feeUsd: .feeUsd, cashtag: .cashtag, payment}'

# Is "garage" free?
curl -sS '${API_BASE}/api/registry/register?name=garage' | jq .`}
      />

      <H2 id="start">Start registration</H2>
      <Endpoint method="POST" path="/api/registry/register">
        Body action <code className="font-mono">start</code> returns a payment
        note and Cash App deep link.
      </Endpoint>
      <CodeBlock
        lang="bash"
        code={`curl -sS -X POST ${API_BASE}/api/registry/register \\
  -H 'content-type: application/json' \\
  -d '{
    "action": "start",
    "name": "garage",
    "label": "Garage node",
    "class": "S",
    "region": "NA-W",
    "nodeId": "node_macmini",
    "kinds": ["node", "compute"]
  }' | jq .`}
      />
      <P>Typical success payload includes:</P>
      <Ul>
        <li>
          <code className="font-mono">id</code> — registration id
        </li>
        <li>
          <code className="font-mono">paymentNote</code> — exact note for Cash App
        </li>
        <li>
          <code className="font-mono">feeUsd</code> — usually 5.00
        </li>
        <li>
          Cash App pay URL with amount + note
        </li>
      </Ul>

      <H2 id="confirm">Confirm payment</H2>
      <CodeBlock
        lang="bash"
        code={`curl -sS -X POST ${API_BASE}/api/registry/register \\
  -H 'content-type: application/json' \\
  -d '{
    "action": "confirm",
    "id": "reg_…",
    "cashConfirm": "optional confirmation text from Cash App"
  }' | jq .`}
      />
      <P>
        After confirm, status moves to{" "}
        <code className="font-mono">pending_review</code> until human review
        marks it <code className="font-mono">active</code>. Only{" "}
        <code className="font-mono">active</code> names appear in{" "}
        <code className="font-mono">GET /api/registry</code>.
      </P>

      <H2 id="statuses">Statuses</H2>
      <Table
        headers={["Status", "Meaning"]}
        rows={[
          ["pending_payment", "Awaiting Cash App send with exact note"],
          ["pending_review", "Payment claimed — waiting on human review"],
          ["active", "Listed on registry.grid"],
          ["rejected", "Not activated (name may be retried per policy)"],
        ]}
      />

      <H2 id="kinds">Kinds</H2>
      <P>
        Register as <code className="font-mono">node</code>,{" "}
        <code className="font-mono">compute</code>, or both. To show up as
        capacity on registry.grid you need the compute kind (and later capacity
        heartbeats). To show as a mesh node identity, include node.
      </P>
    </>
  );
}
