import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "GRID News | Phase 1: A letter to the crypto community",
  description:
    "A Phase 1 founder letter on why GRID is being built, proof-of-resource compute, and the path from transactions to useful work.",
};

const published = "July 28, 2026";

function ArticleDiagram() {
  return (
    <figure className="my-12 overflow-hidden border border-cyan-300/20 bg-cyan-300/[0.035] p-5 sm:p-8">
      <figcaption className="font-mono text-[0.65rem] tracking-[0.18em] text-cyan-200/65 uppercase">
        Phase 1 system view
      </figcaption>
      <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
        <div className="border border-white/12 bg-black/20 p-5">
          <p className="font-mono text-xs text-cyan-300">01 · TX</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Miners verify</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            P2P miners replicate signed history and perform capped verification work.
          </p>
        </div>
        <div className="grid place-items-center text-cyan-300/55" aria-hidden="true">→</div>
        <div className="border border-white/12 bg-black/20 p-5">
          <p className="font-mono text-xs text-emerald-300">02 · COMPUTE</p>
          <h3 className="mt-3 text-lg font-semibold text-white">PoR measures</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Authorized work is measured, checked, scored, and turned into a receipt.
          </p>
        </div>
        <div className="grid place-items-center text-cyan-300/55" aria-hidden="true">→</div>
        <div className="border border-white/12 bg-black/20 p-5">
          <p className="font-mono text-xs text-amber-200">03 · SETTLEMENT</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Peers inspect</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Genesis signs Phase 1 blocks; connected peers synchronize and verify them.
          </p>
        </div>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-white/35">
        Today, Genesis remains the finalizer. This diagram shows the running pilot, not a claim of decentralized finality.
      </p>
    </figure>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 border-l-2 border-cyan-300 pl-6 text-2xl leading-snug font-medium tracking-tight text-white sm:text-3xl">
      {children}
    </blockquote>
  );
}

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pb-16 pt-36 sm:pb-24 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.65rem] tracking-[0.16em] uppercase">
            <span className="border border-cyan-300/30 bg-cyan-300/[0.08] px-3 py-1.5 text-cyan-200">GRID News</span>
            <span className="border border-white/15 px-3 py-1.5 text-white/45">Phase 1</span>
            <time className="text-white/35" dateTime="2026-07-28">{published}</time>
          </div>
          <p className="mt-10 font-mono text-xs tracking-[0.18em] text-cyan-300/70 uppercase">A letter from the founder</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(3.4rem,8vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-white">
            Crypto should secure more than a ledger.
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-relaxed text-white/55 sm:text-2xl">
            GRID is being built to turn independently owned hardware into verifiable,
            useful compute—without pretending that the work is already finished.
          </p>
        </div>
      </header>

      <article className="px-5 pb-24 pt-12 sm:pb-32">
        <div className="mx-auto max-w-3xl">
          <div className="border-y border-white/10 py-5 font-mono text-[0.65rem] tracking-[0.14em] text-white/35 uppercase">
            News release · Network architecture · Proof of Resource
          </div>

          <div className="mt-12 space-y-7 text-[1.05rem] leading-8 text-white/62 sm:text-lg sm:leading-9">
            <p>
              To the crypto community: we did not start GRID because the world needs another ticker, another dashboard, or another claim that a protocol is finished before it has earned that description. We started it because there is a harder question worth answering. Can a network recognize useful computational contribution, verify it with evidence, and let ordinary machines participate in something larger than themselves?
            </p>
            <p>
              Blockchains taught the world that strangers can coordinate around shared rules. They also made the cost of security visible. The next challenge is not to dismiss that lesson. It is to carry it forward: to build systems where security work and useful work can reinforce one another, while remaining honest about who has authority and what remains centralized in the early stages.
            </p>

            <PullQuote>
              GRID begins with a simple conviction: a network should be able to measure what a machine actually contributes, not merely what it can burn.
            </PullQuote>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Two kinds of work, one accountable network</h2>
            <p>
              In Phase 1, GRID separates two jobs that are often blended together in crypto conversations. <strong className="text-white">Transactions and settlement history</strong> need miners and peers that replicate, inspect, and verify signed data. <strong className="text-white">Compute</strong> needs a way to describe available resources, assign authorized work, check results, and record the outcome. The first is the integrity path. The second is the utility path.
            </p>
            <p>
              When we say <strong className="text-white">TX = miners</strong>, we mean that GRID miners participate in the P2P verification path: they synchronize signed blocks, validate the settlement history they receive, and perform capped proof-of-resource verification work. This is not a promise that every machine is already a permissionless block producer. Today, Genesis signs canonical Phase 1 blocks. Connected peers can inspect and reject invalid signed history, but Genesis remains the finalizer while independent validator quorum is built and audited.
            </p>
            <p>
              When we say <strong className="text-white">Compute = PoR</strong>, we mean that useful capacity needs its own evidence trail. A machine’s CPU, GPU, memory, storage, bandwidth, availability, and completed jobs are not automatically valuable simply because they exist. Contribution has to be authorized, measured, verified, scored, and settled. That process is what we call Proof of Resource.
            </p>

            <ArticleDiagram />

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">What Proof of Resource actually means</h2>
            <p>
              Proof of Resource is not a slogan for “any computer gets paid.” It is a discipline for recognizing useful participation. In the model described in the <Link href="/white-paper" className="text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-cyan-200">GRID white paper</Link>, a contributor offers constrained resources; the network coordinates an authorized task; the result is checked; and a signed receipt becomes the basis for recognition. The important word is not resource. It is proof.
            </p>
            <p>
              A good resource network has to be selective. It should care about whether the work was completed correctly, whether it arrived in time, whether the node is reliable, and whether the measurement can be repeated. Phase 1 therefore treats raw hardware as an input, not an entitlement. The coordinator verifies pilot work and produces settlement information; peers synchronize signed block history; the explorer gives the public a place to inspect the visible system rather than accept a marketing claim.
            </p>
            <p>
              This is also why GRID is being built in layers. The first layer is observability: can operators see a peer, a receipt, a block, and a coarse network footprint without publishing sensitive node details? The second is verification: can the network reject a bad result rather than merely record an assertion? The third is execution: can workloads run inside a restrained, isolated host environment without getting access to operator vaults, private keys, host paths, or the container runtime itself? Each layer has to stand before the next one can carry real weight.
            </p>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Why build it now</h2>
            <p>
              Compute is becoming a fundamental resource. It powers research, media, simulation, automation, local services, and the tools people use every day. Yet much of the world’s capacity is either locked inside large providers or left idle behind household, studio, and small-business machines. There is room for a network that gives those operators a meaningful way to contribute without asking them to surrender their identity, their keys, or control of their machines.
            </p>
            <p>
              GRID is an attempt to make that contribution legible. A node should be able to say: these are the resources I am willing to offer; these are my limits; this is the work I completed; this is the proof; and this is the settlement record others can inspect. The operator remains an operator, not an invisible commodity. The network’s job is to coordinate around those boundaries, not erase them.
            </p>

            <PullQuote>
              The goal is not to make every device public. The goal is to let every willing operator contribute with evidence, limits, and control.
            </PullQuote>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">The honest Phase 1 promise</h2>
            <p>
              Phase 1 is deliberately a beginning. The public system includes a Genesis node, an encrypted P2P path, proof-of-resource coordination, signed settlement-chain data, privacy-preserving registry pings, and an explorer. It also includes an Engine foundation for container hosting: runtime checks, encrypted-volume key scaffolding, and a tightly limited Git-backed Caddy service manifest. The Engine does not yet deploy customer containers or expose a production workload tunnel, and it should not be described as though it does.
            </p>
            <p>
              Decentralized mainnet is not a label we can grant ourselves. It requires independent validators, enforced quorum certificates, durable segmented block storage, tested recovery, operational independence, clear treasury and allocation controls, and outside security review. Until that work is complete, Genesis leadership is a transparent Phase 1 fact—not something hidden behind language.
            </p>
            <p>
              If you want to help, the most useful thing is not blind belief. Run a peer. Run a miner. Inspect the explorer. Read the white paper. Point out where the system’s claims exceed its evidence. Build with us only where the boundaries are clear. Trust in a network should grow from what people can verify, not what they are asked to imagine.
            </p>
          </div>

          <section className="mt-16 border border-emerald-300/20 bg-emerald-300/[0.05] p-7 sm:p-9">
            <p className="font-mono text-xs tracking-[0.18em] text-emerald-200 uppercase">Continue reading</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Start with the evidence.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
              Learn the contribution model, inspect the running pilot, or join as an operator. GRID is a work in progress; the public record should make that visible.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/por" className="btn-primary">Read Proof of Resource</Link>
              <a href="https://explorer.grid-compute.com" className="btn-ghost">Open explorer</a>
              <Link href="/quick" className="btn-ghost">Run a node</Link>
            </div>
          </section>
        </div>
      </article>

      <Footer />
    </main>
  );
}
