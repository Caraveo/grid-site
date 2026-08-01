import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = metadataFor("/news/open");

const published = "July 29, 2026";

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 border-l-2 border-emerald-300 pl-6 text-2xl leading-snug font-medium tracking-tight text-white sm:text-3xl">
      {children}
    </blockquote>
  );
}

function OpenEvidence() {
  const metrics = [
    { value: "≈1B", label: "public + open-source contributions", width: "100%", color: "bg-cyan-300" },
    { value: "1.4M", label: "first-time open-source contributors", width: "72%", color: "bg-emerald-300" },
    { value: "82%", label: "container users running Kubernetes in production", width: "82%", color: "bg-amber-200" },
  ];

  return (
    <figure className="my-12 border border-white/10 bg-white/[0.025] p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <figcaption>
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-cyan-200/70 uppercase">
            Open is already operating at infrastructure scale
          </p>
          <p className="mt-2 text-sm text-white/35">Selected ecosystem signals</p>
        </figcaption>
        <span className="font-mono text-[0.6rem] tracking-[0.12em] text-white/25 uppercase">2024–2026 reports</span>
      </div>

      <div className="mt-9 space-y-7">
        {metrics.map((metric) => (
          <div key={metric.value}>
            <div className="mb-2 flex items-end justify-between gap-4">
              <span className="font-mono text-2xl font-semibold text-white">{metric.value}</span>
              <span className="max-w-[65%] text-right text-xs leading-relaxed text-white/45">{metric.label}</span>
            </div>
            <div className="h-2 overflow-hidden bg-white/[0.06]">
              <div className={`h-full ${metric.color}`} style={{ width: metric.width }} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-7 text-[0.68rem] leading-relaxed text-white/30">
        Sources: GitHub Octoverse 2024 (contributions and first-time contributors);
        CNCF Annual Cloud Native Survey published January 2026 (Kubernetes production
        adoption among container users). Bars compare reported magnitudes only within
        their own measures.
      </p>
    </figure>
  );
}

function VerificationLoop() {
  const steps = [
    ["01", "Read", "Anyone can inspect the rules, protocol, and implementation."],
    ["02", "Reproduce", "Independent operators can run the same code and test the same claims."],
    ["03", "Challenge", "Researchers and contributors can surface failures in public."],
    ["04", "Improve", "Fixes become reviewable changes, not private assurances."],
  ];

  return (
    <figure className="my-12 overflow-hidden border border-emerald-300/20 bg-emerald-300/[0.035] p-5 sm:p-8">
      <figcaption className="font-mono text-[0.65rem] tracking-[0.18em] text-emerald-200/70 uppercase">
        The community verification loop
      </figcaption>
      <div className="mt-7 grid gap-px bg-white/10 md:grid-cols-4">
        {steps.map(([number, title, copy]) => (
          <div key={number} className="bg-[#07100f] p-5">
            <span className="font-mono text-xs text-emerald-300">{number}</span>
            <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/45">{copy}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3 font-mono text-[0.62rem] tracking-[0.13em] text-emerald-200/45 uppercase">
        <span>Evidence</span><span>→</span><span>Consensus</span><span>→</span><span>Trust earned</span>
      </div>
    </figure>
  );
}

export default function OpenNewsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="relative overflow-hidden px-5 pb-16 pt-36 sm:pb-24 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/[0.07] blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.65rem] tracking-[0.16em] uppercase">
            <Link href="/news" className="border border-emerald-300/30 bg-emerald-300/[0.08] px-3 py-1.5 text-emerald-200 transition hover:bg-emerald-300/[0.14]">GRID News</Link>
            <span className="border border-white/15 px-3 py-1.5 text-white/45">Announcement</span>
            <time className="text-white/35" dateTime="2026-07-29">{published}</time>
          </div>
          <p className="mt-10 font-mono text-xs tracking-[0.2em] text-emerald-300/70 uppercase">A commitment, not a campaign</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(4.2rem,11vw,8.4rem)] font-semibold leading-[0.82] tracking-[-0.07em] text-white">
            We’re going <span className="text-emerald-300">open.</span>
          </h1>
          <p className="mt-9 max-w-3xl text-xl leading-relaxed text-white/55 sm:text-2xl">
            Infrastructure that coordinates compute, money, and human effort should
            not ask the public for blind trust. Its code, rules, and evidence should
            be open to everyone.
          </p>
        </div>
      </header>

      <article className="px-5 pb-24 pt-12 sm:pb-32">
        <div className="mx-auto max-w-3xl">
          <div className="border-y border-white/10 py-5 font-mono text-[0.65rem] tracking-[0.14em] text-white/35 uppercase">
            Open source · Open infrastructure · Community verification
          </div>

          <div className="mt-12 space-y-7 text-[1.05rem] leading-8 text-white/62 sm:text-lg sm:leading-9">
            <p>
              Today, GRID is making a simple commitment: we are going open. We are
              opening the core code, protocols, and technical work behind the network
              so that what we build can be read, run, questioned, tested, and improved
              by the people it is meant to serve.
            </p>
            <p>
              This matters everywhere software has power. It matters even more when
              software allocates infrastructure, coordinates monetary systems, or
              decides how decentralized computing work is measured and rewarded. In
              those systems, a private implementation creates a public dependency.
              People inherit rules they cannot inspect and risks they cannot
              independently measure. Open code changes that relationship.
            </p>

            <PullQuote>
              When software becomes infrastructure, inspectability is not a feature.
              It is part of the social contract.
            </PullQuote>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Open code makes trust testable
            </h2>
            <p>
              Open source does not make code correct by magic. It makes correctness
              contestable. A claim can be traced to an implementation. An
              implementation can be reproduced. A vulnerability can be documented. A
              fix can be reviewed in the same public record as the failure. That
              process converts trust from a brand promise into work that a community
              can examine.
            </p>
            <p>
              For a decentralized compute network, this is essential. Operators
              should be able to see what a node executes, what it measures, what it
              signs, what it shares, and what it refuses to expose. Contributors
              should be able to verify that a Proof of Resource receipt corresponds
              to the published rules. Researchers should be able to challenge our
              assumptions without needing permission from us first.
            </p>

            <VerificationLoop />

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Open communities are part of the architecture
            </h2>
            <p>
              A repository alone is not a community. Open communities need legible
              issues, useful documentation, respectful review, explicit security
              channels, and a real path from outside contribution to accepted change.
              They need maintainers who explain decisions and contributors who can
              disagree with the implementation while sharing responsibility for the
              outcome.
            </p>
            <p>
              The scale is already real. GitHub reported nearly one billion
              contributions to public and open-source projects in 2024, with 1.4
              million developers making a first open-source contribution that year.
              CNCF’s survey published in 2026 found that 82% of surveyed container
              users were running Kubernetes in production. Open collaboration is not
              a fringe production method. It is one of the ways modern infrastructure
              is built.
            </p>

            <OpenEvidence />

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Monetary systems require stronger evidence
            </h2>
            <p>
              Money turns software behavior into material consequence. A rounding
              rule, signature check, allocation schedule, or privileged key path can
              move value and alter incentives. When those mechanisms are hidden,
              participants can observe outputs but cannot fully verify the rules that
              produced them. That is too weak a foundation for a system that asks a
              community to coordinate around shared value.
            </p>
            <p>
              Opening code does not remove governance, judgment, or operational
              authority. It makes them visible. The public can distinguish the rules
              enforced by software from the powers held by people. The network can
              document what is decentralized today, what remains under Genesis
              control in Phase 1, and what technical milestones must be reached before
              authority can responsibly move outward.
            </p>

            <PullQuote>
              Decentralization is not something a project declares. It is something
              independent people can reproduce, verify, and refuse.
            </PullQuote>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              What “open” will mean at GRID
            </h2>
            <p>
              It means publishing the code necessary to understand and operate the
              network, alongside the protocols that explain how its parts communicate.
              It means maintaining reproducible build and verification paths. It means
              tracking known limits in public, documenting security boundaries, and
              treating scrutiny as a contribution rather than an inconvenience.
            </p>
            <p>
              It also means protecting the people who participate. Open code should
              not require open private keys, open personal data, or unrestricted
              access to an operator’s machine. Transparency belongs in the protocol
              and implementation; privacy and control belong with the operator. GRID’s
              job is to make those boundaries explicit and enforceable.
            </p>
            <p>
              We will not measure openness by the day a repository becomes visible.
              We will measure it by whether another person can understand the system,
              reproduce its behavior, raise a hard question, and help make the network
              better. This announcement begins that work. The community will tell us
              whether we have done it well.
            </p>
          </div>

          <section className="mt-16 border border-cyan-300/20 bg-cyan-300/[0.045] p-7 sm:p-9">
            <p className="font-mono text-xs tracking-[0.18em] text-cyan-200 uppercase">Build in the open</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Read it. Run it. Question it.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
              Start with GRID’s architecture and current Phase 1 boundaries. Open
              participation begins with a shared understanding of what the network
              does—and what it does not do yet.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/white-paper" className="btn-primary">Read the white paper</Link>
              <Link href="/quick" className="btn-ghost">Run a node</Link>
              <Link href="/news/letter" className="btn-ghost">Read the founder letter</Link>
            </div>
          </section>

          <aside className="mt-8 text-xs leading-relaxed text-white/30">
            Data sources:{" "}
            <a className="underline decoration-white/20 underline-offset-4 hover:text-white/55" href="https://github.blog/news-insights/octoverse/octoverse-2024/">
              GitHub Octoverse 2024
            </a>{" "}
            and{" "}
            <a className="underline decoration-white/20 underline-offset-4 hover:text-white/55" href="https://www.cncf.io/reports/the-cncf-annual-cloud-native-survey/">
              CNCF Annual Cloud Native Survey
            </a>.
          </aside>
        </div>
      </article>

      <Footer />
    </main>
  );
}
