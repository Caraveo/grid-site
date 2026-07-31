import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = metadataFor("/white-paper");

const layers = [
  {
    number: "01",
    name: "Resource",
    copy: "CPU, GPU, memory, storage, bandwidth, and availability contributed by independently operated machines.",
  },
  {
    number: "02",
    name: "Coordination",
    copy: "Work discovery, scheduling, routing, and dynamic balancing across heterogeneous nodes.",
  },
  {
    number: "03",
    name: "Verification",
    copy: "Result commitments, timing, redundant checks, signed receipts, and reputation derived from observed performance.",
  },
  {
    number: "04",
    name: "Application",
    copy: "A unified interface through which AI, rendering, simulation, and data workloads can consume capacity.",
  },
];

const useCases = [
  ["AI workloads", "Training, inference, and distributed model operations."],
  ["Graphics", "Rendering, spatial computing, and visual production pipelines."],
  ["Simulation", "Parallel scientific, engineering, and physical-system workloads."],
  ["Data", "Large-scale processing that can be divided into verifiable tasks."],
];

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-white/10 px-5 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export default function WhitePaperPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="section-label">GRID white paper · overview</p>
          <h1 className="mt-6 max-w-6xl text-[clamp(3.5rem,9vw,8rem)] font-semibold leading-[0.87] tracking-[-0.06em] text-white">
            Millions of machines.
            <br />
            <span className="text-cyan-300">One compute fabric.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/50 sm:text-xl">
            GRID’s thesis is simple: the largest useful computer will emerge from
            connected machines working together. The network measures real resources,
            verifies completed work, and turns independent hardware into shared capacity.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/downloads/GRID-White-Paper.pdf"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Read original
            </a>
          </div>
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5 font-mono text-[0.65rem] tracking-[0.14em] text-white/30 uppercase">
            <span>10 pages</span>
            <span>Architecture</span>
            <span>Proof of Resource</span>
            <span>Resource economy</span>
          </div>
        </div>
      </header>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="section-label">The central idea</p>
            <h2 className="section-title mt-5">Useful computation is the work.</h2>
            <p className="section-body mt-6">
              Traditional mining proves expenditure on a protocol-specific puzzle.
              GRID instead measures contribution to authorized workloads: processing
              capacity, availability, efficiency, reliability, completed jobs, latency,
              and bandwidth.
            </p>
          </div>
          <div className="border border-cyan-300/20 bg-cyan-300/[0.045] p-7 sm:p-10">
            <p className="font-mono text-xs tracking-[0.18em] text-cyan-200/60 uppercase">
              White-paper pipeline
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">
              {["Resource contribution", "Resource measurement", "Computational verification", "Network recognition"].map(
                (label, index) => (
                  <div key={label} className="contents">
                    <div className="border border-white/12 bg-black/20 px-4 py-5 text-center text-sm font-medium text-white/75">
                      {label}
                    </div>
                    {index < 3 ? (
                      <span className="hidden text-center text-cyan-300/45 sm:block" aria-hidden="true">→</span>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <p className="section-label">Layered architecture</p>
        <h2 className="section-title mt-5 max-w-4xl">Complexity below. A unified fabric above.</h2>
        <div className="mt-14 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">
          {layers.map((layer) => (
            <article key={layer.name} className="min-h-64 bg-background p-7 sm:p-9">
              <p className="font-mono text-xs text-cyan-300/50">{layer.number}</p>
              <h3 className="mt-8 text-2xl font-semibold text-white">{layer.name} layer</h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/45">{layer.copy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="section-label">Nodes remain autonomous</p>
            <h2 className="section-title mt-5">Contribute on your own terms.</h2>
            <p className="section-body mt-6">
              The architecture is hardware-agnostic. A node operator chooses utilization
              limits, power and thermal boundaries, schedules, and which resources are
              available. Coordination should route work around those constraints—not
              erase them.
            </p>
          </div>
          <div>
            <p className="section-label">Trust from evidence</p>
            <h2 className="section-title mt-5">Reputation follows performance.</h2>
            <p className="section-body mt-6">
              Verification measures whether authorized work was completed accurately
              and on time. Signed results, repeatable checks, and operational history
              allow reliable nodes to build reputation without assumed authority.
            </p>
            <a href="/por" className="mt-8 inline-flex text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
              Explore Proof of Resource →
            </a>
          </div>
        </div>
      </Section>

      <Section>
        <p className="section-label">What the fabric can serve</p>
        <h2 className="section-title mt-5 max-w-4xl">One resource pool. Many kinds of work.</h2>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map(([title, copy]) => (
            <article key={title} className="panel min-h-52 p-6">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/42">{copy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="border border-emerald-300/20 bg-emerald-300/[0.05] p-7 sm:p-9">
            <p className="section-label">Running pilot</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
              The building blocks are observable.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              GRID currently operates a public Genesis node, P2P replication,
              privacy-preserving node telemetry, a coordinator, verified settlement
              receipts, and Genesis-signed blocks.
            </p>
            <a href="https://explorer.grid-compute.com" className="mt-7 inline-flex text-sm font-medium text-emerald-300">
              Verify the live network →
            </a>
          </article>
          <article className="border border-amber-300/20 bg-amber-300/[0.05] p-7 sm:p-9">
            <p className="section-label">Vision boundary</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
              The paper describes the destination.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              A planetary permissionless compute marketplace, decentralized block
              finality, universal workload support, and mature token economics remain
              roadmap goals. They are not presented here as completed mainnet features.
            </p>
          </article>
        </div>
      </Section>

      <Section className="text-center">
        <p className="section-label">Original document</p>
        <h2 className="section-title mx-auto mt-5 max-w-4xl">Read the complete architecture and vision.</h2>
        <p className="section-body mx-auto mt-6">
          Open the original ten-page GRID white paper.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="/downloads/GRID-White-Paper.pdf"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Read original
          </a>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
