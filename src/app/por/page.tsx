import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = metadataFor("/por");

const pipeline = [
  {
    number: "01",
    title: "Contribute",
    copy: "A node advertises available CPU, GPU, memory, storage, and operating limits.",
  },
  {
    number: "02",
    title: "Execute",
    copy: "The coordinator assigns authorized work and the node produces a result commitment.",
  },
  {
    number: "03",
    title: "Verify",
    copy: "Results, timing, and receipts are checked before any contribution is recognized.",
  },
  {
    number: "04",
    title: "Score",
    copy: "Verified contribution becomes a weighted resource score adjusted by reputation.",
  },
  {
    number: "05",
    title: "Settle",
    copy: "Accepted receipts are committed to a signed block and become inspectable settlement history.",
  },
];

const signals = [
  ["55%", "Compute", "Verified processing contribution"],
  ["15%", "Uptime", "Availability while participating"],
  ["10%", "Efficiency", "Useful output relative to resources"],
  ["20%", "Fidelity", "Completed work that verifies correctly"],
];

const implementation = [
  ["Live", "Resource telemetry and privacy-preserving node pings"],
  ["Live", "Coordinator claims, verification, and signed settlement receipts"],
  ["Live", "Weighted PoR scoring, reputation adjustment, and emission allocation"],
  ["Live", "Genesis-signed blocks replicated and checked by P2P peers"],
  ["Pilot", "Open participation is being tested on the Genesis-led network"],
  ["Planned", "Permissionless block production and decentralized finality"],
];

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`border-t border-foreground/10 px-5 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export default function PorPage() {
  return (
    <main className="por-page min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="section-label">Proof of Resource · PoR</p>
          <h1 className="mt-6 max-w-6xl text-[clamp(3.5rem,9vw,8rem)] font-semibold leading-[0.87] tracking-[-0.06em] text-foreground">
            Consensus around
            <br />
            <span className="text-[var(--por-blue)]">useful work.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted sm:text-xl">
            GRID measures real computational contribution—not an abstract puzzle.
            Work is assigned, verified, scored, and recorded as a signed settlement
            that peers can independently inspect.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#pipeline" className="btn-primary">See the pipeline</a>
            <a href="https://explorer.grid-compute.com" className="btn-ghost">
              Inspect live blocks
            </a>
          </div>

          <div className="mt-14 max-w-4xl border border-[var(--por-yellow)]/25 bg-[var(--por-yellow)]/[0.06] p-5 sm:p-6">
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[var(--por-yellow)] uppercase">
              Current consensus boundary
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Proof of Resource currently governs contribution measurement and reward
              allocation. Blocks are produced by the Genesis authority and verified by
              connected peers. GRID does not yet claim permissionless production or
              decentralized finality.
            </p>
          </div>
        </div>
      </header>

      <Section id="pipeline">
        <div className="max-w-3xl">
          <p className="section-label">From machine to settlement</p>
          <h2 className="section-title mt-5">Five checkpoints. One auditable receipt.</h2>
          <p className="section-body mt-6">
            Raw hardware alone earns nothing. Recognition begins only after useful work
            reaches the verification and settlement path.
          </p>
        </div>

        <ol className="por-pipeline mt-14 grid gap-px overflow-hidden border border-foreground/10 bg-foreground/10 lg:grid-cols-5">
          {pipeline.map((step) => (
            <li key={step.number} className="por-pipeline-step min-h-64 bg-background p-6">
              <span className="font-mono text-xs text-[var(--por-blue)]">{step.number}</span>
              <div className="my-7 flex items-center" aria-hidden="true">
                <span className="grid size-9 place-items-center rounded-full border border-[var(--por-blue)]/55 bg-[var(--por-blue)]/[0.1]">
                  <span className="size-2 rounded-full bg-[var(--por-blue)]" />
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--por-blue)]/55 to-transparent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--por-copy)]">{step.copy}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="score">
        <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="section-label">The score</p>
            <h2 className="section-title mt-5">Contribution has more than one dimension.</h2>
            <p className="section-body mt-6">
              Processing carries the greatest weight, but availability, efficiency,
              and correct results matter too. Every input is normalized before it
              enters the score.
            </p>
          </div>
          <div>
            <div className="border border-foreground/12 bg-foreground/[0.025] p-6 sm:p-8">
              <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
                Implemented formula
              </p>
              <p className="mt-6 overflow-x-auto font-mono text-lg leading-loose text-[var(--por-blue)] sm:text-2xl">
                R = .55C + .15U + .10E + .20F
              </p>
              <p className="mt-2 font-mono text-base text-muted sm:text-xl">
                Effective score = R × reputation
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted">
                Reputation is constrained to a 0.5–1.5 multiplier so prior performance
                influences rewards without replacing current verified work.
              </p>
            </div>
            <div className="mt-px grid gap-px bg-foreground/10 sm:grid-cols-2">
              {signals.map(([weight, title, copy]) => (
                <article key={title} className="bg-background p-6">
                  <p className="font-mono text-2xl text-[var(--por-blue)]">{weight}</p>
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="allocation">
        <div className="max-w-3xl">
          <p className="section-label">Fair allocation</p>
          <h2 className="section-title mt-5">Reward useful work without rewarding centralization.</h2>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          <article className="panel p-7 sm:p-9">
            <p className="font-mono text-4xl text-[var(--por-green)]">90%</p>
            <h3 className="mt-6 text-xl font-semibold text-foreground">Proportional pool</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Distributed by effective PoR score after verified work is accepted.
            </p>
          </article>
          <article className="panel p-7 sm:p-9">
            <p className="font-mono text-4xl text-[var(--por-green)]">10%</p>
            <h3 className="mt-6 text-xl font-semibold text-foreground">Inclusion pool</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Reserved for qualifying small nodes so home contributors remain
              first-class participants.
            </p>
          </article>
          <article className="panel p-7 sm:p-9">
            <p className="font-mono text-4xl text-[var(--por-green)]">5%</p>
            <h3 className="mt-6 text-xl font-semibold text-foreground">Base cluster ceiling</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Large coordinated clusters are water-filled against a ceiling. The
              effective cap expands for very small networks so rewards are not stranded.
            </p>
          </article>
        </div>
      </Section>

      <Section id="status">
        <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="section-label">Reality check</p>
            <h2 className="section-title mt-5">What exists today.</h2>
            <p className="section-body mt-6">
              The white paper describes the destination. This ledger separates the
              running pilot from the remaining protocol work.
            </p>
          </div>
          <div className="border-t border-foreground/12">
            {implementation.map(([status, copy]) => (
              <div
                key={copy}
                className="grid gap-3 border-b border-foreground/12 py-5 sm:grid-cols-[7rem_1fr] sm:items-center"
              >
                <span
                  className={`font-mono text-[0.65rem] tracking-[0.16em] uppercase ${
                    status === "Live"
                      ? "text-[var(--por-green)]"
                      : status === "Pilot"
                        ? "text-[var(--por-blue)]"
                        : "text-muted"
                  }`}
                >
                  {status}
                </span>
                <span className="text-sm leading-relaxed text-muted">{copy}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="text-center">
        <p className="section-label">Go deeper</p>
        <h2 className="section-title mx-auto mt-5 max-w-4xl">The protocol starts with measurable truth.</h2>
        <p className="section-body mx-auto mt-6">
          Read the architecture, then inspect the running settlement chain.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href="/white-paper" className="btn-primary">Read the white paper</a>
          <a href="https://explorer.grid-compute.com" className="btn-ghost">Open Explorer</a>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
