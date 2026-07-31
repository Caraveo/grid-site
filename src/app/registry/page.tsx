import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RegisterFlow } from "@/components/RegisterFlow";
import { ScrambleText } from "@/components/ScrambleText";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGES.registry);

function Section({
  id,
  label,
  title,
  children,
}: {
  id?: string;
  label: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative border-t border-white/10 px-5 py-16 sm:py-20"
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

export default function RegistryPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="min-h-screen pt-16 lg:pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-12 pt-16 sm:pt-24 sm:pb-16">
          <div className="pointer-events-none absolute inset-0 hero-glow opacity-70" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="section-label">
              <ScrambleText text="Registry" />
            </p>
            <h1 className="mt-5 text-[clamp(2.2rem,6vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
              Public names.
              <br />
              <span className="font-thin text-white/70">Paid to be real.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl section-body text-center text-base sm:text-lg">
              <span className="font-mono text-white/80">registry.grid</span> is
              the public directory of nodes and computes. No IPs. No free name
              spam. Activation is{" "}
              <strong className="font-normal text-white/90">
                Cash App only · $5 → $Caraveo
              </strong>{" "}
              with your exact note — then human review.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#register" className="btn-primary">
                Register a name
              </a>
              <a href="/docs/concepts#realm-stack" className="btn-ghost">
                What is a realm stack?
              </a>
              <a href="/explain" className="btn-ghost">
                Explain GRID
              </a>
            </div>
          </div>
        </section>

        {/* Why pay */}
        <Section
          id="why"
          label="01 · Why a fee"
          title={
            <>
              <span className="line-through decoration-white/50 decoration-2">
                Abuse
              </span>{" "}
              is free.
              <br />
              <span className="font-thin text-white/70">
                Review is not.
              </span>
            </>
          }
        >
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                t: "Anti-spam",
                d: "Without a fee, anyone could squat every short realm overnight. The $5 gate keeps names meaningful.",
              },
              {
                t: "Employment",
                d: "Someone verifies Cash App notes and approves names. The fee funds that review work — real human jobs on the mesh edge.",
              },
              {
                t: "Donations",
                d: "Registry fee is $5 with the exact note. Extra support anytime at $Caraveo — donations accepted, no pressure.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <p className="font-mono text-[0.65rem] tracking-[0.18em] text-white/40 uppercase">
                  {x.t}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* What you get */}
        <Section
          label="02 · What activation unlocks"
          title={
            <>
              Realm-stack registry leg
              <br />
              <span className="font-thin text-white/70">&amp; public presence</span>
            </>
          }
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4 section-body text-base">
              <p>
                After status is <span className="text-white/85">active</span>,
                your name may appear on the public directory and accept capacity
                announces. Until then,{" "}
                <code className="font-mono text-white/70">
                  grid compute announce
                </code>{" "}
                is rejected for that name (HTTP 402).
              </p>
              <p>
                A <a href="/docs/concepts#realm-stack" className="text-white underline-offset-4 hover:underline">realm stack</a>{" "}
                combines host + mine + compute +{" "}
                <strong className="font-normal text-white/85">this paid registry leg</strong>
                . Local mining works without it; public mesh identity does not.
              </p>
            </div>
            <div className="panel p-6 font-mono text-sm leading-relaxed text-white/70">
              <p className="text-white/40">// CLI</p>
              <p className="mt-3">grid register fire</p>
              <p className="mt-1 text-white/40">
                # → pay $5 Cash App $Caraveo + note
              </p>
              <p className="mt-3">grid register fire --confirm</p>
              <p className="mt-1 text-white/40"># → pending review</p>
              <p className="mt-3">grid register fire --status</p>
              <p className="mt-1 text-white/40"># → activated YES</p>
              <p className="mt-3">grid ember fire</p>
              <p className="mt-1 text-white/40">
                # registry checklist [x] when active
              </p>
            </div>
          </div>
        </Section>

        {/* Steps */}
        <Section
          label="03 · Flow"
          title={
            <>
              Name · Identity · Pay · Review
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Name",
                d: "Pick an available grid:// realm. Register as node and/or compute.",
              },
              {
                n: "02",
                t: "IdentityKey",
                d: "Optional passkey. Proves device control for the registration.",
              },
              {
                n: "03",
                t: "Cash App $5",
                d: "Pay $Caraveo only. Exact note required. Donations accepted.",
              },
              {
                n: "04",
                t: "Approve",
                d: "Confirm payment. Admin verifies note → status active.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-5"
              >
                <p className="font-mono text-[0.65rem] tracking-[0.18em] text-white/35">
                  {s.n}
                </p>
                <p className="mt-2 text-sm font-medium tracking-wide text-white">
                  {s.t}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Register form */}
        <section
          id="register"
          className="relative border-t border-white/10 px-5 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="section-label">
                <ScrambleText text="04 · Register" />
              </p>
              <h2 className="section-title mt-4">
                Reserve your{" "}
                <span className="font-thin">realm</span>
              </h2>
              <p className="mx-auto mt-5 max-w-lg section-body text-center text-sm sm:text-base">
                Optional{" "}
                <strong className="font-normal text-white/80">IdentityKey</strong>
                , then{" "}
                <strong className="font-normal text-white/80">Cash App only</strong>{" "}
                to <span className="font-mono text-white">$Caraveo</span>. Fee is
                non-refundable once submitted for review.
              </p>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-6 sm:p-10">
              <RegisterFlow />
            </div>

            <div className="mt-10 rounded-2xl border border-[#ff6a1a]/25 bg-[#ff6a1a]/[0.06] px-5 py-6 sm:px-8">
              <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#ff6a1a] uppercase">
                Pay · Cash App only
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Send <strong className="text-white">$5.00</strong> to{" "}
                <span className="font-mono text-white">$Caraveo</span> with the
                exact note shown after you reserve a name. No other rails.
                Donations (any amount) also go to{" "}
                <span className="font-mono text-white/90">$Caraveo</span>.
              </p>
            </div>

            <p className="mt-8 text-center text-xs leading-relaxed text-white/30">
              Location-only mesh data never includes IPs, ports, or endpoints.
              Names that violate policy may be rejected. Registration fee is
              non-refundable once payment is submitted for review.
            </p>
          </div>
        </section>

        {/* Related */}
        <section className="relative border-t border-white/10 px-5 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-label">Related</p>
            <h2 className="section-title mt-4">After you&apos;re active</h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href="/docs/concepts#realm-stack" className="btn-primary">
                Realm stack guide
              </a>
              <a href="/explain#realms" className="btn-ghost">
                Realms
              </a>
              <a href="/#download" className="btn-ghost">
                Download CLI
              </a>
              <a href="/#mesh" className="btn-ghost">
                MESH browser
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
