import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { H1, H2, H3, Lead, Note, P, Table, Ul } from "@/components/docs/DocsChrome";

export const metadata: Metadata = metadataFor("/docs/concepts");

export default function ConceptsPage() {
  return (
    <>
      <H1>Concepts</H1>
      <Lead>
        Shared vocabulary for the compute network, settlement chain, public
        registry, and mesh. Public descriptions never grant privileged access to
        another operator&apos;s machine.
      </Lead>

      <H2 id="genesis">Genesis</H2>
      <P>
        The current <strong className="text-foreground">Genesis node</strong> is
        the pilot bootstrap, signed-truth authority, and block producer. Peers know
        its canonical hostname and public key, then independently verify the blocks
        they receive. Genesis-led does not mean permissionless finality; that remains
        roadmap work.
      </P>

      <H2 id="coordinator">Coordinator</H2>
      <P>
        The <strong className="text-foreground">coordinator</strong> accepts jobs,
        assigns them to eligible nodes, records intent and result commitments, and
        emits a settlement receipt only after verification. It does not publish
        operator private keys or trust a node&apos;s claimed result without checking it.
      </P>

      <H2 id="block">Settlement block</H2>
      <P>
        A block links to the previous block, commits a state root, includes verified
        settlement inputs and allocations, and is signed by the current leader.
        Replicas replay allocation math rather than trusting a coordinator-supplied
        number.
      </P>

      <H2 id="node">Node</H2>
      <P>
        A <strong className="text-foreground">node</strong> is a machine running
        the GRID stack (CLI / ember). Nodes can host useful work, mine Proof of
        Resource (PoR), verify P2P blocks, and announce capacity. Publicly you see an
        opaque <code className="font-mono text-foreground">nodeId</code>, a
        human label, class (<code className="font-mono">S|M|L</code>), region
        code, and optional coarse coordinates for the globe.
      </P>

      <H2 id="compute">Compute</H2>
      <P>
        A <strong className="text-foreground">compute</strong> is a named unit
        of capacity attached to a node — for example a containerized service
        with free slots. The public directory advertises{" "}
        <em>availability</em> (slots, status, image label), not how to SSH or
        HTTP-dial the host.
      </P>

      <H2 id="name-realm">Name / realm</H2>
      <P>
        Public names look like <code className="font-mono text-foreground">fire</code>{" "}
        and resolve in Mesh as{" "}
        <code className="font-mono text-foreground">grid://fire.grid</code>. A
        name must be <strong className="text-foreground">activated</strong> on
        the registry ($5 Cash App fee + human review) before it appears in{" "}
        <code className="font-mono">GET /api/registry</code> as an entry.
      </P>
      <Note>
        Names are scarce public identifiers. They prevent spam on the directory
        and fund review employment. Donations to the same Cash App cashtag are
        accepted separately from activation fees.
      </Note>

      <H2 id="registry">Registry (registry.grid)</H2>
      <P>
        The registry is the HTTPS source of truth for{" "}
        <strong className="text-foreground">who is allowed to show up</strong>{" "}
        as a public node and/or compute. Live mesh heartbeats alone do not put
        you on the directory — only active paid registrations do.
      </P>

      <H2 id="mesh">Mesh globe</H2>
      <P>
        The mesh API powers the cinematic globe on the site. Peers may opt in to
        a location-only ping (coarse lat/lng). The map is public presence telemetry,
        not the P2P routing table, and it never publishes raw IP addresses.
      </P>

      <H2 id="por">Proof of Resource</H2>
      <P>
        PoR scores verified contribution using compute, uptime, efficiency, fidelity,
        and bounded reputation. It currently controls reward allocation; it does not
        yet elect permissionless block producers.
      </P>

      <H2 id="realm-stack">Realm stack</H2>
      <P>
        A <strong className="text-foreground">realm stack</strong> is the full local
        operator stack for one realm: host useful jobs + mine PoR + serve compute +
        keep the registry announcement fresh. The current CLI command is{" "}
        <code className="font-mono text-foreground">grid ember &lt;name&gt; --start</code>.
      </P>

      <H2 id="class-region">Class & region</H2>
      <Table
        headers={["Field", "Values", "Meaning"]}
        rows={[
          ["class", "S · M · L", "Relative machine / capacity band"],
          ["region", "e.g. NA-W", "Coarse geography label (not an IP geo)"],
          ["status", "online · offline · busy · available…", "Presence or capacity state"],
          ["visibility", "public · private", "Whether a compute is listed broadly"],
        ]}
      />

      <H2 id="identity">Identity badges</H2>
      <P>
        Optional paid upgrades attach public badges to a realm:
      </P>
      <Ul>
        <li>
          <strong className="text-foreground">Key</strong> — permanent
          registry-signed identity cert for the realm (security feature).
        </li>
        <li>
          <strong className="text-foreground">Verified</strong> — organization /
          entity verification on top of Key semantics.
        </li>
      </Ul>
      <P>
        Badge state is readable from{" "}
        <code className="font-mono">GET /api/registry/entity?realm=…</code>.
        Private signing material never appears in public responses.
      </P>

      <H3 id="bitcoin-tsl">Bitcoin as Transact Security Layer</H3>
      <P>
        GRID treats Bitcoin as the settlement / security layer for value, while
        useful work and compute happen on the mesh. Public APIs describe{" "}
        <em>resource presence</em>; they do not expose wallet private keys or
        settlement rails beyond marketing cashtags used for activation fees.
      </P>
    </>
  );
}
