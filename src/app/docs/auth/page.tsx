import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, Note, P, Table, Ul } from "@/components/docs/DocsChrome";

export const metadata = {
  title: "Auth for writes",
  description:
    "Signed node heartbeats and operator authentication for GRID write APIs.",
};

export default function AuthDocsPage() {
  return (
    <>
      <H1>Auth for writes</H1>
      <Lead>
        Read endpoints are public. Globe heartbeats use per-node Ed25519
        identity; privileged capacity-directory writes use an operator webhook
        secret.
      </Lead>

      <H2 id="heartbeat">Public node heartbeats</H2>
      <P>
        The GRID CLI creates a dedicated private key at{" "}
        <code className="font-mono">~/.grid/keys/mesh-heartbeat.key</code>. It
        signs every location pulse with a timestamp and random nonce. The server
        derives the node ID from the public key, verifies the signature, and
        rejects replayed or stale messages atomically.
      </P>
      <CodeBlock
        lang="bash"
        code={`# No shared globe secret is required.
GRID_GLOBE_LAT=37.7
GRID_GLOBE_LNG=-122.4
GRID_GLOBE_REGION=NA-W

grid init --name garage --class S
grid node`}
      />

      <H2 id="header">Operator write authentication</H2>
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

curl -sS -X POST https://grid-compute.com/api/registry/computes \\
  -H 'content-type: application/json' \\
  -H "authorization: Bearer $GRID_WEBHOOK_SECRET" \\
  -d @announce.json`}
      />

      <H2 id="which">Which routes need it</H2>
      <Ul>
        <li>
          <code className="font-mono">POST /api/mesh/ping</code> — node
          signature, not bearer auth
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
        <li>Rotate the webhook secret for privileged compute writers together</li>
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
