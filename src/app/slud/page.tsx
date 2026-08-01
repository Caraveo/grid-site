import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrambleText } from "@/components/ScrambleText";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = metadataFor("/slud");

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
      className="relative border-t border-white/10 px-5 py-20 sm:py-28"
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

const legacySins = [
  "Fake reviews",
  "Cloned content",
  "Deceptive ads",
  "Tracking scripts",
  "Bot traffic",
  "Dark patterns",
  "AI-generated garbage",
];

const protections = [
  { k: "01", t: "No spam", d: "Noise never reaches the surface." },
  { k: "02", t: "No scams", d: "Fraud is blocked before it loads." },
  { k: "03", t: "No slop", d: "Synthetic landfill stays buried." },
  {
    k: "04",
    t: "No silent tracking",
    d: "Your path is not a product.",
  },
  {
    k: "05",
    t: "No manipulation",
    d: "Convenience is never a disguise.",
  },
];

const killList = [
  { t: "Surveillance", d: "Kill the watchers." },
  { t: "Noise", d: "Kill the feed that never ends." },
  { t: "Fraud", d: "Kill the cloned storefronts." },
  { t: "Algorithmic landfill", d: "Kill the slop factory." },
];

const pipeline = [
  {
    k: "SCAN",
    d: "Inspect what is about to load — before it owns your attention.",
  },
  {
    k: "BLOCK",
    d: "Stop spam, scams, trackers, and slop at the edge.",
  },
  {
    k: "VERIFY",
    d: "Trust is checked. Identity stays protected.",
  },
  {
    k: "PROTECT",
    d: "You stay in control. The browser defends you.",
  },
];

const slogans = [
  "Is your web SLUD?",
  "Spam. Scam. Slop. Blocked.",
  "Protection by default.",
  "The legacy web is dead weight.",
  "Browse clean. Browse protected.",
  "KillTheWeb. Save the Internet.",
  "This. Is. The. New. Web.",
];

export default function SludPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="min-h-screen pt-16 lg:pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:pt-24 sm:pb-24">
          <div className="pointer-events-none absolute inset-0 hero-glow" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-80" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="section-label">
              <ScrambleText text="SLUD" />
            </p>
            <h1 className="mt-5 text-[clamp(2.5rem,8vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Is your web{" "}
              <span className="text-[#ff6a1a]">
                <ScrambleText text="SLUD" />
              </span>
              ?
            </h1>
            <p className="mx-auto mt-8 max-w-xl font-mono text-lg tracking-[0.2em] text-white/70 uppercase sm:text-xl">
              <span className="text-white">Spam</span>
              <span className="text-white/30">. </span>
              <span className="text-white">Scam</span>
              <span className="text-white/30">. </span>
              <span className="text-white">Slop</span>
              <span className="text-white/30">.</span>
            </p>
            <p className="mx-auto mt-8 max-w-2xl section-body text-center text-base sm:text-lg">
              The legacy web is buried under fake reviews, cloned content,
              deceptive ads, tracking scripts, bot traffic, dark patterns, and
              AI-generated garbage.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm font-medium tracking-wide text-white/55 sm:text-base">
              It was built to capture attention.
              <br />
              <span className="text-white/80">Not protect people.</span>
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href="#new-web" className="btn-primary">
                The new web
              </a>
              <a href="#detect" className="btn-ghost">
                SLUD detected
              </a>
              <a href="/mesh" className="btn-ghost">
                Get MESH
              </a>
            </div>
          </div>
        </section>

        {/* What is SLUD */}
        <Section
          id="what"
          label="01 · Definition"
          title={
            <>
              Spam. Scam. Slop.
              <br />
              <span className="font-thin text-white/70">That is SLUD.</span>
            </>
          }
        >
          <p className="mb-10 max-w-2xl section-body text-base sm:text-lg">
            Three failure modes of the legacy web — often stacked, rarely
            optional, almost never honest about what they are doing to you.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                letter: "S",
                word: "Spam",
                d: "Unsolicited noise engineered to steal focus and drown signal.",
              },
              {
                letter: "S",
                word: "Scam",
                d: "Deception dressed as a site, a deal, a login, a friend.",
              },
              {
                letter: "S",
                word: "Slop",
                d: "AI-generated landfill and cloned content with no human stake.",
              },
            ].map((item) => (
              <div key={item.word} className="panel p-6">
                <p className="font-mono text-[0.65rem] tracking-[0.2em] text-[#ff6a1a] uppercase">
                  {item.letter} · {item.word}
                </p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {item.word}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Legacy web */}
        <Section
          id="legacy"
          label="02 · Legacy web"
          title={
            <>
              Built to capture attention.
              <br />
              <span className="font-thin text-white/70">
                Not protect people.
              </span>
            </>
          }
        >
          <p className="mb-8 max-w-2xl section-body text-base sm:text-lg">
            The open web became an extraction layer. Attention is the product.
            Trust is optional. Defense is an afterthought you bolt on yourself —
            if you know how.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {legacySins.map((sin, i) => (
              <li
                key={sin}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <span className="font-mono text-[0.65rem] tracking-widest text-white/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-white/70">{sin}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* New web */}
        <Section
          id="new-web"
          label="03 · The new web"
          title={
            <>
              This. Is. The. New. Web.
              <br />
              <span className="font-thin text-white/70">
                Protection by default.
              </span>
            </>
          }
        >
          <p className="mb-10 max-w-2xl section-body text-base sm:text-lg">
            A cleaner, safer, human-first network — where trust is verified,
            identity is protected, and users stay in control.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {protections.map((item) => (
              <div key={item.k} className="panel p-5">
                <span className="font-mono text-[0.65rem] tracking-widest text-white/35">
                  {item.k}
                </span>
                <h3 className="mt-3 text-sm font-semibold tracking-wide uppercase">
                  <ScrambleText text={item.t} />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* KillTheWeb */}
        <Section
          id="kill"
          label="04 · KillTheWeb"
          title={
            <>
              Not the internet.
              <br />
              <span className="font-thin text-white/70">
                The broken version of it.
              </span>
            </>
          }
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5 section-body text-base sm:text-lg">
              <p>
                Kill the surveillance. Kill the noise. Kill the fraud. Kill the
                algorithmic landfill.
              </p>
              <p className="text-white/80">
                <strong className="font-semibold text-white">
                  Kill the legacy web.
                </strong>{" "}
                Build what comes next.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {killList.map((item) => (
                <div
                  key={item.t}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#ff6a1a]/40"
                >
                  <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#ff6a1a] uppercase">
                    Kill
                  </p>
                  <h3 className="mt-2 text-sm font-semibold tracking-wide">
                    {item.t}
                  </h3>
                  <p className="mt-2 text-sm text-white/45">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* SLUD DETECTED */}
        <section
          id="detect"
          className="relative overflow-hidden border-t border-white/10 px-5 py-20 sm:py-28"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(255,106,26,0.12)_0%,transparent_65%)]" />
          <div className="relative mx-auto max-w-5xl">
            <div className="panel overflow-hidden p-6 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <p className="font-mono text-[0.65rem] tracking-[0.25em] text-[#ff6a1a] uppercase">
                  SLUD DETECTED
                </p>
                <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-widest text-white/40 uppercase">
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6a1a]"
                    aria-hidden
                  />
                  Live posture
                </span>
              </div>
              <h2 className="mt-8 max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                Your browser should not merely load the web.
                <br />
                <span className="font-thin text-white/65">
                  It should defend you from it.
                </span>
              </h2>
              <p className="mt-8 font-mono text-sm tracking-[0.28em] text-white uppercase sm:text-base">
                SCAN. BLOCK. VERIFY. PROTECT.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pipeline.map((step, i) => (
                  <div
                    key={step.k}
                    className="rounded-xl border border-white/10 bg-black/40 p-4"
                  >
                    <p className="font-mono text-[0.6rem] tracking-widest text-white/30">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 font-mono text-sm font-semibold tracking-[0.15em] text-white">
                      {step.k}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-white/45">
                      {step.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core slogans */}
        <Section
          id="slogans"
          label="05 · Core slogans"
          title={
            <>
              Say it clean.
              <br />
              <span className="font-thin text-white/70">Mean it hard.</span>
            </>
          }
        >
          <ul className="grid gap-3">
            {slogans.map((line, i) => (
              <li
                key={line}
                className="group flex items-baseline gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                <span className="shrink-0 font-mono text-[0.65rem] tracking-widest text-white/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-medium tracking-tight text-white/85 sm:text-lg group-hover:text-white">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {/* CTA */}
        <section className="relative border-t border-white/10 px-5 py-24">
          <div className="pointer-events-none absolute inset-0 hero-glow opacity-40" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="section-label">
              <ScrambleText text="Next" />
            </p>
            <h2 className="section-title mt-4">
              Browse clean.
              <br />
              <span className="font-thin text-white/70">Browse protected.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg section-body text-center">
              KillTheWeb. Save the Internet. Get MESH — the desktop browser for
              a network that does not treat you as inventory.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href="/mesh" className="btn-primary">
                Download MESH
              </a>
              <a href="/explain" className="btn-ghost">
                Explain GRID
              </a>
              <a href="/#mission" className="btn-ghost">
                Mission
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
