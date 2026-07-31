import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, P } from "@/components/docs/DocsChrome";
import { API_BASE } from "@/lib/docs-nav";

export const metadata: Metadata = metadataFor("/docs/examples");

export default function ExamplesPage() {
  return (
    <>
      <H1>Code examples</H1>
      <Lead>
        Copy-paste snippets against the live public API. All of these are
        read-only unless noted.
      </Lead>

      <H2 id="explorer">curl — chain and upstream health</H2>
      <CodeBlock
        lang="bash"
        code={`curl -fsS ${API_BASE}/api/explorer \\
  | jq '{
      checkedAt,
      health,
      chain: .chain | {chainId, height, tipHash, blocks},
      rewards: .coordinator.rewards,
      settlement
    }'`}
      />

      <H2 id="curl">curl — free capacity poller</H2>
      <CodeBlock
        lang="bash"
        code={`#!/usr/bin/env bash
set -euo pipefail
API=${API_BASE}

while true; do
  curl -fsS "$API/api/registry/computes?available=1" \\
    | jq -r '.computes[]? | "\\(.name)\\tslots=\\(.freeSlots)\\t\\(.class)\\t\\(.region // "-")"'
  sleep 3600
done`}
      />

      <H2 id="js">JavaScript — registry dashboard widget</H2>
      <CodeBlock
        lang="js"
        title="javascript"
        code={`const API = "${API_BASE}";

export async function loadRegistrySummary() {
  const [reg, mesh] = await Promise.all([
    fetch(\`\${API}/api/registry\`).then((r) => r.json()),
    fetch(\`\${API}/api/mesh\`).then((r) => r.json()),
  ]);

  return {
    names: (reg.entries ?? []).map((e) => e.name),
    freeSlots: reg.computeStats?.freeSlots ?? 0,
    onlinePeers: mesh.stats?.online ?? 0,
    updatedAt: reg.updatedAt,
  };
}

// Browser: safe — no secrets
const summary = await loadRegistrySummary();
console.log(summary);`}
      />

      <H2 id="python">Python — filter computes by class</H2>
      <CodeBlock
        lang="python"
        title="python"
        code={`import urllib.request, json

API = "${API_BASE}"

def get_computes(available_only=True):
    q = "?available=1" if available_only else ""
    with urllib.request.urlopen(f"{API}/api/registry/computes{q}") as res:
        return json.load(res)

data = get_computes()
for c in data.get("computes", []):
    if c.get("class") in ("M", "L") and (c.get("freeSlots") or 0) > 0:
        print(c["name"], c["freeSlots"], c.get("image"))`}
      />

      <H2 id="check-name">Name availability</H2>
      <CodeBlock
        lang="bash"
        code={`name=garage
curl -sS "${API_BASE}/api/registry/register?name=$name" | jq '{ok, available, name, reason}'`}
      />

      <H2 id="badges">Badge check for Mesh UI</H2>
      <CodeBlock
        lang="js"
        title="javascript"
        code={`async function realmBadges(realm) {
  const r = await fetch(
    \`${API_BASE}/api/registry/entity?realm=\${encodeURIComponent(realm)}\`
  );
  const j = await r.json();
  return j.badges; // { realm, key, verified }
}

const b = await realmBadges("fire");
// Render chips only — never show internal wire IDs in the address bar`}
      />

      <H2 id="announce">Operator announce (server-side only)</H2>
      <CodeBlock
        lang="bash"
        code={`# Run on the node — secret from env, never from a browser
curl -sS -X POST ${API_BASE}/api/registry/computes \\
  -H 'content-type: application/json' \\
  -H "authorization: Bearer $GRID_WEBHOOK_SECRET" \\
  -d @announce.json`}
      />
      <P>
        Prefer the GRID CLI ember loop over hand-rolled announce scripts in
        production — it handles heartbeats, sanitization, and backoff.
      </P>
    </>
  );
}
