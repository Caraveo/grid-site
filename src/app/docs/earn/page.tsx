import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  H1,
  H2,
  Lead,
  Note,
  P,
  Table,
  Ul,
} from "@/components/docs/DocsChrome";

export const metadata = {
  title: "Earn & use cases",
  description:
    "What you can build and earn on GRID — mining, hosting, compute markets, and apps.",
};

export default function EarnDocsPage() {
  return (
    <>
      <H1>Earn & use cases</H1>
      <Lead>
        GRID is useful mining plus planetary compute. Operators earn by doing
        real work; builders consume capacity and ship apps on public names.
        Figures below are directional — actual earn rates depend on network
        phase, demand, and your hardware.
      </Lead>

      <H2 id="tracks">Operator earn tracks</H2>
      <Table
        headers={["Track", "What you do", "Why it pays"]}
        rows={[
          [
            "Mine (PoR)",
            "Run proof-of-resource / useful security work",
            "Secures the fabric; earn GRID-style credits locally and on-network",
          ],
          [
            "Host",
            "Execute verified host jobs from the coordinator",
            "Higher-weight useful work than pure PoR on many phases",
          ],
          [
            "Compute",
            "Advertise free slots for named services",
            "Others discover you via the registry; you fill demand",
          ],
          [
            "Name / brand",
            "Hold an activated realm (e.g. fire.grid)",
            "Memorable identity in Mesh; optional Key / Verified upgrades",
          ],
        ]}
      />

      <H2 id="starter">Starter path (solo garage)</H2>
      <Ul>
        <li>Activate a name ($5) as node + compute</li>
        <li>
          Run <code className="font-mono">grid ember &lt;name&gt; --start</code>
        </li>
        <li>Leave globe coords opt-in if you want a map pin</li>
        <li>Watch freeSlots + mine/host completions in CLI logs</li>
      </Ul>
      <CodeBlock
        lang="bash"
        code={`grid ember garage --start
# host track  → useful jobs
# mine track  → PoR earn ticks
# compute     → registry announce of free slots
# registry    → stay listed while active + online`}
      />

      <H2 id="builder">Builder use cases</H2>
      <Table
        headers={["Idea", "Public API you use", "Notes"]}
        rows={[
          [
            "Capacity dashboard",
            "GET /api/registry + /computes?available=1",
            "Show free slots by region/class",
          ],
          [
            "Mesh presence map",
            "GET /api/mesh",
            "Coarse pins only — great for marketing / explorer UIs",
          ],
          [
            "Name marketplace UI",
            "GET /api/registry/register?name=",
            "Check availability before UX checkout",
          ],
          [
            "Trust badges in apps",
            "GET /api/registry/entity?realm=",
            "Show Key / Verified chips next to grid:// names",
          ],
          [
            "Job broker",
            "Computes directory + your own matchmaking",
            "Registry finds capacity; your protocol schedules work",
          ],
          [
            "Status page / SRE bot",
            "Registry stats + compute offline counts",
            "Alert when critical realms go offline",
          ],
        ]}
      />

      <H2 id="scenarios">Concrete scenarios</H2>
      <H2 id="cdn-like">1. Garage edge service</H2>
      <P>
        Register <code className="font-mono">garage</code>, run a small container
        compute, announce 2–4 free slots. Apps that need burst CPU poll
        available computes and schedule batch transforms. You earn when slots
        fill; the public API never exposes your home IP.
      </P>

      <H2 id="lab">2. University lab cluster</H2>
      <P>
        Several M/L class nodes under one brand name (or related names). Mine
        overnight for security rewards; publish public computes during class
        hours for student workloads discovered through the registry.
      </P>

      <H2 id="indie">3. Indie Mesh app</H2>
      <P>
        Ship a Mesh experience at <code className="font-mono">grid://yourname.grid</code>.
        Use badge APIs to show Key status, registry to prove you&apos;re real,
        and compute slots for any backend agents the experience needs.
      </P>

      <H2 id="agent">4. Agent runtime marketplace</H2>
      <P>
        Agents query <code className="font-mono">?available=1</code>, pick class
        L regions near users, and rent short-lived slots. Settlement can ride
        Bitcoin TSL rails while discovery stays on the HTTPS registry.
      </P>

      <H2 id="math">Back-of-envelope (illustrative only)</H2>
      <CodeBlock
        lang="text"
        title="not financial advice"
        code={`Assume phase-1 demo rates on a small node (order-of-magnitude):
  mine tick   ~ tens of earn units / job
  host job    ~ higher weight than mine
  compute     ~ priced by your own deals once demand exists

Activation costs (public):
  name        $5   — list on registry.grid
  Key         $300 — permanent identity cert / badge
  Verified    $10k — org-grade badge

These fees fund human review & anti-abuse — they are not mining rewards.`}
      />

      <Note>
        Earn numbers change with network phase and policy. Build against the
        public JSON contracts; treat reward math as product surface that will
        evolve. Never require users to paste seed phrases into third-party sites.
      </Note>

      <H2 id="what-not">What not to build</H2>
      <Ul>
        <li>Scrapers that try to recover IPs from the globe (coords are coarse by design)</li>
        <li>Clients that demand private keys to “verify” a name</li>
        <li>Services that re-publish webhook secrets to browsers</li>
        <li>Fake registries that impersonate grid-compute.com without TLS identity</li>
      </Ul>
    </>
  );
}
