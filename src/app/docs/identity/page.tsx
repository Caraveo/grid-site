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
  title: "Identity badges",
  description:
    "Public Key and Verified badges and certificate verification for GRID realms.",
};

export default function IdentityDocsPage() {
  return (
    <>
      <H1>Identity badges</H1>
      <Lead>
        Optional upgrades attach public trust signals to a realm. Clients can
        read badges and verify permanent certificate signatures using only the
        public CA key — private CA material is never exposed.
      </Lead>

      <H2 id="fees">Public fee table</H2>
      <Endpoint method="GET" path="/api/registry/entity">
        Returns fee schedule for Key and Verified applications.
      </Endpoint>
      <CodeBlock
        lang="bash"
        code={`curl -sS ${API_BASE}/api/registry/entity | jq .`}
      />
      <Table
        headers={["Tier", "Fee (USD)", "Public signal"]}
        rows={[
          ["key", "300", "[Key] badge — permanent identity cert"],
          ["verified", "10,000", "[Verified] entity badge"],
        ]}
      />

      <H2 id="badges">Read badges</H2>
      <Endpoint method="GET" path="/api/registry/entity?realm=fire">
        Public badges only for a realm.
      </Endpoint>
      <CodeBlock
        lang="bash"
        code={`curl -sS '${API_BASE}/api/registry/entity?realm=fire' | jq .`}
      />

      <H2 id="cert">Certificate (public verify)</H2>
      <Endpoint method="GET" path="/api/registry/entity?realm=fire&cert=1">
        Badges plus permanent cert JSON when active.
      </Endpoint>
      <Endpoint method="GET" path="/api/registry/entity?ca=1">
        Registry CA public key for offline verification.
      </Endpoint>
      <CodeBlock
        lang="bash"
        code={`curl -sS '${API_BASE}/api/registry/entity?ca=1' | jq .
curl -sS '${API_BASE}/api/registry/entity?realm=fire&cert=1' | jq '.cert'`}
      />

      <H2 id="apply">Apply (Cash App)</H2>
      <Endpoint method="POST" path="/api/registry/entity">
        Start or confirm an application. Same Cash App rail as name activation
        ($Caraveo + note). Realm should already be registered.
      </Endpoint>
      <CodeBlock
        lang="bash"
        code={`# Start Key application (fields validated server-side)
curl -sS -X POST ${API_BASE}/api/registry/entity \\
  -H 'content-type: application/json' \\
  -d '{
    "action": "start",
    "tier": "key",
    "realm": "fire",
    "pubkeyHex": "<64-hex-ed25519-pubkey>",
    "nodeId": "node_macmini"
  }' | jq .`}
      />
      <P>
        After payment confirmation and successful review, an active application
        may include a permanent cert payload. Mesh UIs show only the human{" "}
        <code className="font-mono">grid://</code> locator plus badge chips —
        not internal wire identifiers.
      </P>

      <Note>
        Never paste operator private keys into API bodies. Only public keys and
        realm metadata are accepted on write. Certificate private CA seeds are
        server-side only.
      </Note>
    </>
  );
}
