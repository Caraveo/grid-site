import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, Note, P, Ul } from "@/components/docs/DocsChrome";
import { API_BASE } from "@/lib/docs-nav";

export const metadata = {
  title: "Getting started",
  description: "First GRID public API calls and operator path.",
};

export default function GettingStartedPage() {
  return (
    <>
      <H1>Getting started</H1>
      <Lead>
        Two tracks: <strong className="text-foreground">read the network</strong>{" "}
        (no auth) and <strong className="text-foreground">run a node</strong>{" "}
        (CLI + optional webhook secret for heartbeats).
      </Lead>

      <H2 id="read">1. Read the public directory</H2>
      <CodeBlock
        lang="bash"
        code={`# Canonical registry snapshot
curl -sS ${API_BASE}/api/registry | jq '{entries, computeStats, stats}'

# Free compute slots only
curl -sS '${API_BASE}/api/registry/computes?available=1' | jq '.stats'

# Globe peers (coarse location)
curl -sS ${API_BASE}/api/mesh | jq '.peers'`}
      />

      <H2 id="js">2. JavaScript (browser or Node)</H2>
      <CodeBlock
        lang="js"
        title="javascript"
        code={`const res = await fetch("${API_BASE}/api/registry");
const data = await res.json();

// Active public names
for (const e of data.entries ?? []) {
  console.log(e.name, e.kinds, e.computeStatus);
}

// How many free slots network-wide?
console.log(data.computeStats);`}
      />

      <H2 id="operator">3. Operator path (earn + host)</H2>
      <Ul>
        <li>
          Install the{" "}
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/cli">
            GRID CLI
          </Link>
        </li>
        <li>
          Pick a name and{" "}
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/register">
            activate it
          </Link>{" "}
          ($5 Cash App → $Caraveo with the exact note)
        </li>
        <li>
          Run an ember: host + mine + compute + registry announce
        </li>
        <li>
          Optionally set globe coordinates and{" "}
          <code className="font-mono">GRID_WEBHOOK_SECRET</code> for mesh pings
        </li>
      </Ul>
      <CodeBlock
        lang="bash"
        code={`# After install
grid --version
grid registry                 # pull public directory
grid ember fire --start       # example realm once activated`}
      />

      <H2 id="builder">4. Builder path (consume capacity)</H2>
      <P>
        Poll <code className="font-mono">/api/registry/computes?available=1</code>{" "}
        to discover free slots, then coordinate job placement off-band or via
        future job markets. The public API tells you{" "}
        <em>who has free capacity</em>, not a raw socket to open.
      </P>

      <Note>
        Never put webhook secrets in front-end bundles. Read endpoints need no
        secret. Write endpoints use{" "}
        <code className="font-mono">Authorization: Bearer …</code> from the
        operator environment only.
      </Note>

      <P>
        Dive deeper:{" "}
        <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/registry">
          Registry API
        </Link>
        .
      </P>
    </>
  );
}
