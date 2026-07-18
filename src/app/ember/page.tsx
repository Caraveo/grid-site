import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrambleText } from "@/components/ScrambleText";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGES.ember);

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative border-t border-white/10 px-5 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <p className="section-label">
          <ScrambleText text={label} />
        </p>
        <h2 className="section-title mt-4 max-w-3xl">{title}</h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

const legs = [
  {
    k: "Compute",
    cmd: "grid launch fire --public",
    d: "Named capacity unit you own. Replicas = parallel slots. Backs the realm address.",
  },
  {
    k: "Host",
    cmd: "grid host --compute fire",
    d: "Pull useful container jobs. Isolated. Higher earn track.",
  },
  {
    k: "Mine",
    cmd: "grid mine",
    d: "Proof-of-Resource security work (blake3). Slower earn — keeps the mesh honest.",
  },
  {
    k: "Registry",
    cmd: "grid register fire",
    d: "Paid activation on registry.grid. $5 Cash App → $Caraveo with exact note. Admin approve. Donations accepted.",
  },
];

const checklist = [
  { t: "compute", d: "Manifest ready · replicas free" },
  { t: "content", d: "Optional origin for mesh viewers (e.g. video on fire)" },
  { t: "coordinator", d: "Local job fabric up" },
  { t: "host + mine", d: "Daemon claiming jobs" },
  { t: "registry", d: "Paid + approved · then announce capacity" },
  { t: "claim", d: "Optional IdentityKey + operator Ed25519 bind" },
];

export default function EmberPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="min-h-screen pt-16 lg:pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:pt-24 sm:pb-20">
          <div className="pointer-events-none absolute inset-0 hero-glow" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-80" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="section-label">
              <ScrambleText text="Ember" />
            </p>
            <h1 className="mt-5 text-[clamp(2.4rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              One realm.
              <br />
              <span className="font-thin text-white/70">Four legs of fire.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl section-body text-center text-base sm:text-lg">
              An <strong className="font-normal text-white/90">ember</strong> is
              the full stack for a single mesh address —{" "}
              <span className="font-mono text-white/80">grid://fire.grid</span>{" "}
              — so you host useful work, mine security PoR, serve compute, and
              show up on the public registry.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href="#anatomy" className="btn-primary">
                Anatomy
              </a>
              <a href="/registry" className="btn-ghost">
                Activate registry
              </a>
              <a href="/#download" className="btn-ghost">
                Get GRID CLI
              </a>
            </div>
          </div>
        </section>

        {/* Formula */}
        <section className="relative border-t border-white/10 px-5 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="panel overflow-hidden p-6 sm:p-10">
              <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/40 uppercase">
                Definition
              </p>
              <p className="mt-4 font-mono text-lg leading-relaxed text-white sm:text-xl">
                <span className="text-[#ff6a1a]">ember</span>
                <span className="text-white/40"> = </span>
                host
                <span className="text-white/35"> + </span>
                mine
                <span className="text-white/35"> + </span>
                compute
                <span className="text-white/35"> + </span>
                registry
              </p>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/45">
                Not four products. One operator posture for one realm. The CLI
                name is literal:{" "}
                <code className="font-mono text-white/70">grid ember fire</code>
                .
              </p>
            </div>
          </div>
        </section>

        <Section
          id="anatomy"
          label="01 · Anatomy"
          title={
            <>
              What each leg does
              <br />
              <span className="font-thin text-white/70">for fire.grid</span>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {legs.map((leg) => (
              <div
                key={leg.k}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20"
              >
                <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#ff6a1a]/uppercase">
                  {leg.k}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {leg.d}
                </p>
                <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black/50 px-3 py-2 font-mono text-[0.7rem] text-white/70">
                  {leg.cmd}
                </pre>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="registry"
          label="02 · Registry paywall"
          title={
            <>
              Registry must be paid
              <br />
              <span className="font-thin text-white/70">&amp; activated</span>
            </>
          }
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5 section-body text-base">
              <p>
                Anyone can run a local node. Showing up on{" "}
                <span className="font-mono text-white/80">registry.grid</span> is
                different: names are scarce, spam is free, and review takes
                people.
              </p>
              <p>
                So the registry leg of an ember requires{" "}
                <strong className="font-normal text-white/85">
                  Cash App only
                </strong>
                : pay <strong className="text-white">$5</strong> to{" "}
                <span className="font-mono text-white">$Caraveo</span> with the
                exact registration note, confirm, wait for approve.
              </p>
              <p className="text-white/50">
                That fee prevents abuse and funds human review employment.
                Donations above the fee are accepted at{" "}
                <span className="font-mono text-white/70">$Caraveo</span> anytime.
              </p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 sm:p-8">
              <p className="font-mono text-[0.65rem] tracking-[0.18em] text-white/40 uppercase">
                Activate
              </p>
              <ol className="mt-5 space-y-4 font-mono text-sm text-white/70">
                <li>
                  <span className="text-white/35">01 · </span>
                  grid register fire
                </li>
                <li>
                  <span className="text-white/35">02 · </span>
                  Cash App $5 → $Caraveo + note
                </li>
                <li>
                  <span className="text-white/35">03 · </span>
                  grid register fire --confirm
                </li>
                <li>
                  <span className="text-white/35">04 · </span>
                  admin approve → active
                </li>
                <li>
                  <span className="text-white/35">05 · </span>
                  grid ember fire · announce
                </li>
              </ol>
              <a href="/registry" className="btn-primary mt-8 w-full">
                Open registry registration
              </a>
            </div>
          </div>
        </Section>

        <Section
          id="cli"
          label="03 · CLI"
          title={
            <>
              Status &amp; start
              <br />
              <span className="font-thin text-white/70">the ember</span>
            </>
          }
        >
          <div className="panel p-6 sm:p-8 font-mono text-sm leading-relaxed text-white/75">
            <p className="text-white/40"># status of your fire.grid ember</p>
            <p className="mt-2">grid ember fire</p>
            <p className="mt-6 text-white/40">
              # announce + host + mine (foreground)
            </p>
            <p className="mt-2">grid ember fire --start</p>
            <p className="mt-6 text-white/40">
              # or background daemons (coord + node + content)
            </p>
            <p className="mt-2">grid-fabric start</p>
            <p className="mt-6 text-white/40"># identity bind (optional)</p>
            <p className="mt-2">grid auth login && grid claim fire</p>
          </div>

          <div className="mt-10">
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-white/40 uppercase">
              Checklist (grid ember fire)
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {checklist.map((c) => (
                <li
                  key={c.t}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <span className="font-mono text-xs text-[#ff6a1a] uppercase">
                    {c.t}
                  </span>
                  <span className="text-sm text-white/50">{c.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          id="mesh"
          label="04 · MESH"
          title={
            <>
              Open the realm
              <br />
              <span className="font-thin text-white/70">in the browser</span>
            </>
          }
        >
          <p className="max-w-2xl section-body text-base">
            When content is mapped (for example{" "}
            <span className="font-mono text-white/75">fire → 127.0.0.1:8080</span>
            ), MESH opens{" "}
            <span className="font-mono text-white/80">grid://fire.grid</span>{" "}
            like a domain — but it is your ember, not a CDN box in someone
            else&apos;s rack.
          </p>
          <div className="mt-8 panel p-6 font-mono text-sm text-white/70">
            <p className="text-white/40">// type in MESH</p>
            <p className="mt-2">fire</p>
            <p className="mt-1 text-white/40">→ grid://fire.grid/</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/#mesh" className="btn-ghost">
              About MESH
            </a>
            <a href="/explain#realms" className="btn-ghost">
              Realms explained
            </a>
          </div>
        </Section>

        {/* CTA */}
        <section className="relative border-t border-white/10 px-5 py-24">
          <div className="pointer-events-none absolute inset-0 hero-glow opacity-40" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="section-label">Next</p>
            <h2 className="section-title mt-4">Light an ember</h2>
            <p className="mx-auto mt-6 max-w-lg section-body text-center">
              Launch compute, pay the registry fee, run host + mine. One realm —
              fully yours.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href="/registry" className="btn-primary">
                Register · $5 $Caraveo
              </a>
              <a href="/#download" className="btn-ghost">
                Download CLI
              </a>
              <a href="/explain" className="btn-ghost">
                Full explain
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
