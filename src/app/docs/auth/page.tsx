import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, Note, P, Table, Ul } from "@/components/docs/DocsChrome";

export const metadata = {
  title: "Auth for writes",
  description:
    "Webhook bearer authentication for GRID mesh and compute announce APIs.",
};

export default function AuthDocsPage() {
  return (
    <>
      <H1>Auth for writes</H1>
      <Lead>
        Read endpoints are public. Write endpoints that affect the mesh or
        capacity directory require a shared webhook secret configured on the
        operator machine and on the registry Worker.
      </Lead>

      <H2 id="header">How to authenticate</H2>
      <Table
        headers={["Mechanism", "Example"]}
        rows={[
          ["Authorization Bearer", "Authorization: Bearer &lt;GRID_WEBHOOK_SECRET&gt;"],
          ["Custom header", "X-Grid-Secret: &lt;GRID_WEBHOOK_SECRET&gt;"],
        ]}
      />
      <CodeBlock
        lang="bash"
        code={`export GRID_WEBHOOK_SECRET='…'   # never commit

curl -sS -X POST https://grid-compute.com/api/mesh/ping \\
  -H 'content-type: application/json' \\
  -H "authorization: Bearer $GRID_WEBHOOK_SECRET" \\
  -d '{"nodeId":"node_demo","lat":37.7,"lng":-122.4,"class":"S"}'`}
      />

      <H2 id="which">Which routes need it</H2>
      <Ul>
        <li>
          <code className="font-mono">POST /api/mesh/ping</code>
        </li>
        <li>
          <code className="font-mono">POST /api/registry/computes</code>
        </li>
        <li>Other operator announce hooks as they ship</li>
      </Ul>
      <P>
        Name registration and entity applications use Cash App payment notes
        rather than the webhook secret.
      </P>

      <H2 id="practice">Operator practice</H2>
      <Ul>
        <li>Store the secret in <code className="font-mono">~/.grid/env</code> (mode 600)</li>
        <li>Never embed it in Mesh, websites, or mobile apps</li>
        <li>Rotate by updating the Worker secret and all nodes together</li>
        <li>Treat it as an ingress gate, not a user identity system</li>
      </Ul>

      <Note>
        This docs site does not describe privileged internal tooling. If a
        response field would let an attacker harm operators or the ledger
        (private keys, raw dial endpoints, forensic payloads), it is not part of
        the public contract.
      </Note>
    </>
  );
}
