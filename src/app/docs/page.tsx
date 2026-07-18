import Link from "next/link";
import {
  H1,
  H2,
  Lead,
  Note,
  P,
  Table,
  Ul,
} from "@/components/docs/DocsChrome";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { API_BASE } from "@/lib/docs-nav";

export default function DocsHomePage() {
  return (
    <>
      <H1>GRID public API</H1>
      <Lead>
        Data-only documentation for the planetary compute registry. Discover
        names, nodes, and free compute slots — without ever receiving private
        keys, wallet secrets, or host endpoints that would put the network at
        risk.
      </Lead>

      <Note>
        <strong className="text-foreground">Base URL:</strong>{" "}
        <code className="font-mono text-foreground">{API_BASE}</code>
        <br />
        All public JSON endpoints send{" "}
        <code className="font-mono">Access-Control-Allow-Origin: *</code> where
        listed. Writes that mutate the mesh require a shared webhook bearer —
        never ship that secret in browsers.
      </Note>

      <H2 id="what-you-get">What this docs site covers</H2>
      <Ul>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/concepts">
            Concepts
          </Link>{" "}
          — nodes, computes, realms, registry.grid
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/registry">
            Registry API
          </Link>{" "}
          — the canonical directory
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/nodes">
            Nodes & mesh
          </Link>{" "}
          — coarse globe presence (location only)
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/computes">
            Computes
          </Link>{" "}
          — public capacity, free slots
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/register">
            Name registration
          </Link>{" "}
          — activate a public name ($5 Cash App)
        </li>
        <li>
          <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/earn">
            Earn & use cases
          </Link>{" "}
          — what operators and builders can ship
        </li>
      </Ul>

      <H2 id="quick-start">30-second call</H2>
      <CodeBlock
        lang="bash"
        title="curl"
        code={`curl -sS ${API_BASE}/api/registry | jq '.entries[:3], .computeStats'`}
      />

      <H2 id="surface">Public surface map</H2>
      <Table
        headers={["Area", "Read", "Write", "Contains"]}
        rows={[
          [
            "Registry directory",
            "GET /api/registry",
            "—",
            "Paid active names, node/compute roles, capacity stats",
          ],
          [
            "Mesh / globe",
            "GET /api/mesh",
            "POST /api/mesh/ping",
            "Coarse lat/lng, class, region — never IPs",
          ],
          [
            "Computes",
            "GET /api/registry/computes",
            "POST /api/registry/computes",
            "Slots, image labels, availability — no dial endpoints",
          ],
          [
            "Name registration",
            "GET /api/registry/register",
            "POST /api/registry/register",
            "Name lifecycle + Cash App payment notes",
          ],
          [
            "Identity badges",
            "GET /api/registry/entity",
            "POST /api/registry/entity",
            "Key / Verified public badges + optional cert JSON",
          ],
        ]}
      />

      <H2 id="hard-rules">Hard rules (read this)</H2>
      <P>
        GRID&apos;s public API is intentionally hostile to abuse and to leaking
        the data plane that keeps operators safe:
      </P>
      <Ul>
        <li>
          <strong className="text-foreground">No IPs, ports, hostnames, or tunnels</strong>{" "}
          in public registry/mesh JSON.
        </li>
        <li>
          <strong className="text-foreground">No private keys, vault material, or seed phrases</strong>{" "}
          — ever returned by these endpoints.
        </li>
        <li>
          <strong className="text-foreground">No payment rails except the public Cash App cashtag</strong>{" "}
          used for name activation fees.
        </li>
        <li>
          <strong className="text-foreground">Mesh pings are location-only</strong>{" "}
          and quantized for the globe. They do not prove capacity or grant dial
          rights.
        </li>
        <li>
          <strong className="text-foreground">registry.grid listing requires paid activation</strong>{" "}
          plus human review. A globe ping alone does not list you.
        </li>
      </Ul>

      <P>
        Next:{" "}
        <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/getting-started">
          Getting started
        </Link>{" "}
        or jump straight to{" "}
        <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/registry">
          Registry
        </Link>
        .
      </P>
    </>
  );
}
