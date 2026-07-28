import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ScrambleText } from "@/components/ScrambleText";
import {
  AssetRolesDiagram,
  ConsolidationDiagram,
  SolanaLedgerDiagram,
} from "@/components/token/Diagrams";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGES.token);

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
    <section id={id} className={`border-t border-white/10 px-5 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

const flow = [
  ["01", "Compute", "A node completes useful work for a real request."],
  ["02", "Verify", "The network checks that the work meets the requested result."],
  ["03", "Account", "GRID represents the verified utility moving through the network."],
  ["04", "Consolidate", "Solana provides the fast public ownership and transfer rail."],
  ["05", "Settle", "Bitcoin remains the preferred final settlement and security layer."],
];

export default function TokenPage() {
  return (
    <main className="min-h-screen">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pt-36 pb-20 sm:pt-44 sm:pb-28">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="section-label">The token layer</p>
          <h1 className="mt-6 max-w-5xl text-[clamp(3.5rem,10vw,8rem)] leading-[0.88] font-semibold tracking-[-0.055em] text-white">
            GRID <span className="text-white/20">→</span> SOL{" "}
            <span className="text-white/20">→</span> BTC
          </h1>
          <ScrambleText
            text="USEFUL WORK. PORTABLE VALUE. FINAL SETTLEMENT."
            className="mt-8 block font-mono text-xs tracking-[0.22em] text-cyan-200/70 sm:text-sm"
          />
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/50 sm:text-xl">
            GRID meters useful compute. Solana makes that value fast to own and move.
            Bitcoin remains the Transact Security Layer.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#architecture" className="btn-primary">
              See the architecture
            </a>
            <Link href="/explain" className="btn-ghost">
              How GRID works
            </Link>
          </div>
          <div className="mt-16 grid max-w-3xl grid-cols-3 border-y border-white/10 py-5 text-center sm:text-left">
            {[
              ["GRID", "utility"],
              ["SOL", "rail"],
              ["BTC", "settlement"],
            ].map(([asset, role]) => (
              <div key={asset} className="border-r border-white/10 px-2 first:pl-0 last:border-0 sm:px-6">
                <p className="font-mono text-sm font-semibold text-white">{asset}</p>
                <p className="mt-1 text-[0.65rem] tracking-[0.16em] text-white/30 uppercase">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <Section id="architecture">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.6fr] lg:gap-16">
          <div>
            <p className="section-label">One system · three layers</p>
            <h2 className="section-title mt-5">Consolidation, without confusion.</h2>
            <p className="section-body mt-6">
              The layers do different jobs. GRID is the unit of utility. Solana is
              the public transfer network. Bitcoin is the final settlement layer.
            </p>
          </div>
          <ConsolidationDiagram />
        </div>
      </Section>

      <Section id="solana">
        <div className="grid items-start gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="section-label">What is Solana?</p>
            <h2 className="section-title mt-5">A fast, shared record.</h2>
            <p className="section-body mt-6">
              Solana is a public blockchain: many independent validators maintain
              one shared ledger. Wallets sign instructions, validators order and
              confirm them, and everyone can verify the result.
            </p>
            <div className="mt-8 border-l border-cyan-300/35 pl-5">
              <p className="text-sm leading-relaxed text-white/55">
                Think of GRID as the cargo, Solana as the rail, and SOL as the fuel
                that pays the rail&apos;s small network fees.
              </p>
            </div>
          </div>
          <SolanaLedgerDiagram />
        </div>
      </Section>

      <Section>
        <p className="section-label">Three assets · three jobs</p>
        <h2 className="section-title mt-5 max-w-4xl">Connected layers. Separate roles.</h2>
        <p className="section-body mt-6 mb-12">
          SOL is not GRID. GRID is not Bitcoin. Keeping the roles separate makes
          the system easier to use and easier to reason about.
        </p>
        <AssetRolesDiagram />
      </Section>

      <Section id="flow">
        <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div>
            <p className="section-label">The public flow</p>
            <h2 className="section-title mt-5">Work becomes portable value.</h2>
            <p className="section-body mt-6">
              This is the conceptual path. Security-sensitive controls and
              operational details are intentionally not published here.
            </p>
          </div>
          <ol className="border-t border-white/12">
            {flow.map(([number, title, copy]) => (
              <li key={number} className="grid gap-3 border-b border-white/12 py-6 sm:grid-cols-[3rem_9rem_1fr] sm:items-baseline">
                <span className="font-mono text-xs text-cyan-200/50">{number}</span>
                <strong className="text-base font-semibold text-white">{title}</strong>
                <span className="text-sm leading-relaxed text-white/45">{copy}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          <article className="panel rounded-sm p-7 sm:p-9">
            <p className="section-label">Current status</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
              Engineering validation.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/45">
              The token identity and transfer path are being validated on Solana
              devnet. Devnet assets are test assets with no economic value. Mainnet,
              security, custody, legal, and market access are separate release gates.
            </p>
          </article>
          <article className="panel rounded-sm p-7 sm:p-9">
            <p className="section-label">Plain-language boundary</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
              Utility, not a promise.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/45">
              GRID is designed as network utility. It is not equity, a guarantee of
              income, or a promise of price appreciation. Nothing on this page is
              an offer to sell, and no exchange listing is announced here.
            </p>
          </article>
        </div>
      </Section>

      <Section className="text-center">
        <p className="section-label">Build the useful network</p>
        <h2 className="section-title mx-auto mt-5 max-w-4xl">Compute first. Settlement follows.</h2>
        <p className="section-body mx-auto mt-6">
          GRID begins with machines doing verifiable work—not speculation.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/explain" className="btn-primary">Explore GRID</Link>
          <Link href="/#miners" className="btn-ghost">Useful mining</Link>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
