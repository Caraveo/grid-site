import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrambleText } from "@/components/ScrambleText";
import {
  AddressDiagram,
  FlowDiagram,
  GridVsMeshDiagram,
  LayersDiagram,
  MeshPlanetDiagram,
  RolesDiagram,
} from "@/components/explain/Diagrams";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = metadataFor("/explain");

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

export default function ExplainPage() {
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
              <ScrambleText text="Explain" />
            </p>
            <h1 className="mt-5 text-[clamp(2.5rem,8vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              GRID &amp; MESH
              <br />
              <span className="font-thin text-white/70">in plain English</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl section-body text-center text-base sm:text-lg">
              No whitepaper required. This page is the simple picture: what the
              network is, how you earn, and how you open sites on the mesh.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href="#what" className="btn-primary">
                Start simple
              </a>
              <a href="/#download" className="btn-ghost">
                Get GRID
              </a>
            </div>
          </div>
        </section>

        {/* 01 — What is it */}
        <Section
          id="what"
          label="01 · The big idea"
          title={
            <>
              A supercomputer
              <br />
              <span className="font-thin text-white/70">made of everyone</span>
            </>
          }
        >
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="section-body text-base sm:text-lg">
                Today, giant computers live in a few buildings.{" "}
                <strong className="font-normal text-white/85">GRID</strong>{" "}
                flips that: machines everywhere — home GPUs, small racks,
                datacenters — connect and do <em>useful</em> work together.
              </p>
              <p className="mt-6 section-body text-base sm:text-lg">
                Not puzzle mining that only burns power. Real jobs: render,
                transform, run listed containers. Prove you did the work.
                Get paid in GRID.
              </p>
            </div>
            <div className="panel p-4 sm:p-6">
              <MeshPlanetDiagram />
            </div>
          </div>
        </Section>

        {/* 02 — GRID vs MESH */}
        <Section
          id="grid-mesh"
          label="02 · Two names"
          title={
            <>
              GRID is the network.
              <br />
              <span className="font-thin text-white/70">MESH is the browser.</span>
            </>
          }
        >
          <p className="mb-10 max-w-2xl section-body text-base">
            Easy to mix up. Keep this pair in your head:
          </p>
          <GridVsMeshDiagram />
        </Section>

        {/* 03 — Layers */}
        <Section
          id="layers"
          label="03 · Three layers"
          title={
            <>
              Work · GRID · Blockchain
            </>
          }
        >
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="panel p-4 sm:p-6">
              <LayersDiagram />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold tracking-[0.15em] uppercase">
                  Work
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  Hosts run useful jobs. Miners do Proof-of-Resource security
                  work. Both prove contribution.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[0.15em] uppercase">
                  GRID
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  The utility token that meters compute and rewards verified
                  work. It is not equity or a claim on another blockchain.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[0.15em] uppercase">
                  Blockchain · Security
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  <strong className="font-normal text-white/80">
                    Transact Security Layer
                  </strong>
                  . High-value settlement and cash-out path. GRID meters work;
                  Blockchain settlement secures value.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* 04 — How you earn */}
        <Section
          id="flow"
          label="04 · How it moves"
          title={
            <>
              From machine
              <br />
              <span className="font-thin text-white/70">to money path</span>
            </>
          }
        >
          <p className="mb-10 max-w-2xl section-body text-base">
            Five steps. No jargon required.
          </p>
          <FlowDiagram />
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/40">
            Hosts earn more for useful container work. Miners earn slower for
            security PoR. Same network — different tracks.
          </p>
        </Section>

        {/* 05 — Roles */}
        <Section
          id="roles"
          label="05 · The pieces"
          title={
            <>
              Words you&apos;ll see
              <br />
              <span className="font-thin text-white/70">on the site &amp; CLI</span>
            </>
          }
        >
          <RolesDiagram />
        </Section>

        {/* 06 — Realms (MESH “domains”) */}
        <Section
          id="realms"
          label="06 · Realms"
          title={
            <>
              Type a name.
              <br />
              <span className="font-thin text-white/70">
                Default scheme is grid://
              </span>
            </>
          }
        >
          <p className="mb-4 max-w-2xl section-body text-base">
            On the web you type <strong className="font-normal text-white/70">domains</strong>.
            On MESH you type{" "}
            <strong className="font-normal text-white/85">realms</strong>.
            No extension required.
          </p>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-white/40">
            A <span className="text-white/70">realm</span> is the mesh address for a
            compute you (or someone) published — the GRID name for what the web
            calls a domain.
          </p>
          <AddressDiagram />
          <div className="mt-8 panel p-6 font-mono text-sm leading-relaxed text-white/70">
            <p className="text-white/40">// realm equivalence</p>
            <p className="mt-2">
              x &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;≡ &nbsp;
              x.grid &nbsp;&nbsp;&nbsp;&nbsp;≡ &nbsp; grid://x.grid/
            </p>
            <p className="mt-4 text-white/40">// web domain → mesh realm</p>
            <p className="mt-2">
              example.com &nbsp;≈ &nbsp; realm &nbsp;x &nbsp;→ &nbsp; grid://x.grid
            </p>
            <p className="mt-4 text-white/40">// same idea as the CLI</p>
            <p className="mt-2">
              grid launch garage &nbsp;↔ &nbsp; realm garage in MESH
            </p>
          </div>
        </Section>

        {/* 07 — Realm stack */}
        <Section
          id="realm-stack"
          label="07 · Realm stack"
          title={
            <>
              The full stack
              <br />
              <span className="font-thin text-white/70">for one realm</span>
            </>
          }
        >
          <p className="mb-6 max-w-2xl section-body text-base">
            A <strong className="font-normal text-white/85">realm stack</strong> combines
            host + mine + compute +{" "}
            <strong className="font-normal text-white/85">paid registry</strong>{" "}
            for a single address like{" "}
            <span className="font-mono text-white/80">grid://fire.grid</span>.
            Registry activation is Cash App{" "}
            <strong className="text-white/90">$5 → $Caraveo</strong> — prevents
            abuse, funds review employment. Donations accepted.
          </p>
          <div className="panel p-6 font-mono text-sm leading-relaxed text-white/70">
            <p className="text-white/40">// CLI</p>
            <p className="mt-2">grid ember fire</p>
            <p className="mt-1">grid register fire &nbsp;# pay $Caraveo</p>
            <p className="mt-1">grid ember fire --start</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/docs/concepts#realm-stack" className="btn-primary">
              Realm stack guide
            </a>
            <a href="/registry" className="btn-ghost">
              Registry · paywall
            </a>
          </div>
        </Section>

        {/* 08 — CTA */}
        <section className="relative border-t border-white/10 px-5 py-24">
          <div className="pointer-events-none absolute inset-0 hero-glow opacity-40" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="section-label">Next</p>
            <h2 className="section-title mt-4">
              Ready when you are
            </h2>
            <p className="mx-auto mt-6 max-w-lg section-body text-center">
              Install the node, start a realm stack, or activate a public name on the
              registry. The mesh only grows when machines join.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href="/#download" className="btn-primary">
                Download GRID
              </a>
              <a href="/phoenix" className="btn-ghost">
                Phoenix Wallet
              </a>
              <a href="/registry" className="btn-ghost">
                Registry
              </a>
              <a href="/#mesh" className="btn-ghost">
                About MESH
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
