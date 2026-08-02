import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ServiceStatusBoard } from "@/components/ServiceStatusBoard";
import { metadataFor } from "@/lib/seo";

export const metadata: Metadata = metadataFor("/status");

type Feature = {
  name: string;
  percent: number;
  evidence: string;
  next: string;
};

type FeatureGroup = {
  name: string;
  description: string;
  features: Feature[];
};

const featureGroups: FeatureGroup[] = [
  {
    name: "Network foundation",
    description: "The native protocol, operator runtime, signed history, and peer network.",
    features: [
      {
        name: "Rust CLI and operator runtime",
        percent: 82,
        evidence: "Cross-platform releases cover peer, mine, host, node, wallet, benchmark, registry, and Engine commands.",
        next: "Broaden production soak testing and simplify operator recovery.",
      },
      {
        name: "Native identity and wallet",
        percent: 72,
        evidence: "Local vaults, recovery phrases, signing, balances, and a read-only node wallet API are implemented.",
        next: "Complete independent security review and production recovery drills.",
      },
      {
        name: "Genesis and signed blockchain",
        percent: 66,
        evidence: "Genesis produces canonical signed blocks and peers can replicate and verify them.",
        next: "Remove the single-leader trust boundary and harden long-running recovery.",
      },
      {
        name: "Encrypted P2P replication",
        percent: 68,
        evidence: "Noise-encrypted discovery, block replication, signed-chain verification, and inbound/outbound peer modes exist.",
        next: "Increase public peer diversity, adversarial testing, and partition recovery coverage.",
      },
      {
        name: "Proof of Resource mining",
        percent: 58,
        evidence: "Pilot work, receipts, scoring inputs, settlement polling, and capped devnet rewards operate.",
        next: "Add stronger Sybil resistance, broader useful workloads, and audited verification.",
      },
      {
        name: "Public coordinator",
        percent: 55,
        evidence: "A stateful coordinator assigns deterministic pilot work and persists verified settlement receipts.",
        next: "Authenticate operators and decentralize verification and issuance authority.",
      },
      {
        name: "Decentralized validator consensus",
        percent: 18,
        evidence: "Peers independently verify signed history, but Genesis remains the sole canonical finalizer.",
        next: "Specify, implement, test, and audit an enforced independent validator quorum.",
      },
    ],
  },
  {
    name: "Compute fabric",
    description: "Hosting, isolation, useful workloads, scheduling, and verification.",
    features: [
      {
        name: "GRID Engine runtime",
        percent: 50,
        evidence: "Containerd, Lima/WSL paths, encrypted volumes, manifests, capability access, logs, and lifecycle commands exist.",
        next: "Complete cross-platform reliability testing and third-party sandbox review.",
      },
      {
        name: "Approved workload hosting",
        percent: 38,
        evidence: "A narrow Git-backed Caddy workload profile and encrypted private service path are staged.",
        next: "Run multi-host pilots and add carefully allowlisted compute workload families.",
      },
      {
        name: "Scheduling and capacity market",
        percent: 25,
        evidence: "Nodes expose capacity and the coordinator assigns pilot work, but a general buyer marketplace is not live.",
        next: "Add quotes, reservations, job escrow, retries, SLAs, and buyer-facing APIs.",
      },
      {
        name: "Work verification",
        percent: 35,
        evidence: "Deterministic pilot verification and signed receipts exist for narrow work.",
        next: "Add redundant execution, challenges, fraud handling, and workload-specific verifiers.",
      },
      {
        name: "Production workload isolation",
        percent: 22,
        evidence: "The design blocks broad mounts, keys, sockets, capabilities, and public exposure by default.",
        next: "Complete adversarial review, escape testing, resource metering, and incident drills.",
      },
    ],
  },
  {
    name: "Products and public surfaces",
    description: "Interfaces that operators, contributors, developers, and the public can use today.",
    features: [
      {
        name: "Public website",
        percent: 88,
        evidence: "The production site includes product, education, downloads, registry, identity, news, and operational APIs.",
        next: "Keep claims synchronized with engineering reality and expand accessibility testing.",
      },
      {
        name: "Public registry",
        percent: 78,
        evidence: "Signed heartbeats, replay controls, coarse locations, compute records, registration, and public APIs exist.",
        next: "Improve decentralized trust, moderation operations, and long-term availability.",
      },
      {
        name: "Explorer and telemetry",
        percent: 72,
        evidence: "Public views expose blocks, peers, capacity estimates, coordinator state, and Genesis health.",
        next: "Add independent data sources, historical reliability, and alerting transparency.",
      },
      {
        name: "Documentation and School",
        percent: 80,
        evidence: "Operator guides, API references, concepts, security boundaries, examples, lessons, and quizzes are published.",
        next: "Version documentation against releases and close remaining implementation/spec gaps.",
      },
      {
        name: "MESH browser",
        percent: 63,
        evidence: "Tauri desktop clients resolve grid:// names, built-in realms, registry computes, local mappings, and deep links.",
        next: "Complete signed releases, broader OS testing, gateway hardening, and production navigation.",
      },
      {
        name: "Phoenix for macOS",
        percent: 65,
        evidence: "A native SwiftUI wallet integrates the GRID CLI contract and supports Genesis, local, and custom node views.",
        next: "Complete end-to-end transaction UX, signing review, packaging, and sustained beta testing.",
      },
      {
        name: "Phoenix for Windows and Linux",
        percent: 45,
        evidence: "The Tauri desktop source and shared wallet contract exist.",
        next: "Reach feature parity, sign installers, and run platform-specific release testing.",
      },
      {
        name: "ARK mobile wallet",
        percent: 28,
        evidence: "Native and React Native source surfaces exist, with wallet architecture documented.",
        next: "Finish secure signing, recovery, synchronization, platform QA, and store distribution.",
      },
      {
        name: "Contributor identity and mail",
        percent: 52,
        evidence: "Registration, verification, TOTP, approvals, sessions, mailbox UI, and AWS mail architecture are implemented.",
        next: "Complete production infrastructure, deliverability, recovery, abuse controls, and audits.",
      },
    ],
  },
  {
    name: "Economy and settlement",
    description: "Token economics, reward rails, settlement boundaries, and real-value readiness.",
    features: [
      {
        name: "Token economic specification",
        percent: 75,
        evidence: "Supply, allocation, epoch limits, Proof of Resource rewards, inclusion, escrow, and staged growth are documented.",
        next: "Resolve remaining governance choices and validate assumptions with pilot data and counsel.",
      },
      {
        name: "Solana devnet rewards",
        percent: 58,
        evidence: "Devnet minting, metadata, guarded issuance, duplicate rejection, epoch caps, wallets, and issuer bridge exist.",
        next: "Replace operator policy with audited on-chain controls before any mainnet use.",
      },
      {
        name: "Mainnet emission controller",
        percent: 10,
        evidence: "Requirements and safety boundaries are documented; an audited production controller is not deployed.",
        next: "Implement the program, multisig governance, audits, public testing, and reconciliation.",
      },
      {
        name: "Bitcoin Transact Security Layer",
        percent: 18,
        evidence: "Bitcoin is defined as the settlement boundary and CLI architecture contains early support.",
        next: "Implement audited execution, reserve policies, Lightning decisions, and operational settlement.",
      },
      {
        name: "Treasury and allocation disclosure",
        percent: 62,
        evidence: "Allocation totals, GEX reserve, treasury uses, and public diagrams are documented.",
        next: "Bind disclosures to controlled addresses, vesting, governance, and independently verifiable reporting.",
      },
    ],
  },
  {
    name: "GEX and market exchanges",
    description: "Trading, exchange-specific Chips, clearing, custody, and live-value controls.",
    features: [
      {
        name: "GEX trading terminal",
        percent: 45,
        evidence: "The UI, reference feed, fixed-point order contract, schema, and per-market serialized order books exist.",
        next: "Connect committed balances, complete market controls, and pass every launch gate.",
      },
      {
        name: "Authoritative exchange ledger",
        percent: 33,
        evidence: "State, transition, hold, fill, fee, deposit, withdrawal, and replay invariants are specified with partial implementation.",
        next: "Finish Genesis state transitions, double-entry reconciliation, recovery, and independent tests.",
      },
      {
        name: "GEX Exchange Chip model",
        percent: 18,
        evidence: "The exchange-scoped Chip, backing, swap, redemption, and non-transfer rules are now conceptually defined.",
        next: "Freeze the protocol schema and implement issuance, burns, reserves, and user disclosures.",
      },
      {
        name: "Swipe clearing",
        percent: 5,
        evidence: "Exchange → GRID Exchange → exchange clearing semantics and core invariants are defined conceptually.",
        next: "Specify participants, quotes, holds, burns, backing reassignment, destination issuance, failures, and dispute handling.",
      },
      {
        name: "External-asset custody",
        percent: 8,
        evidence: "The required BTC, ETH, SOL, and USDC custody plane is architected but not production-ready.",
        next: "Deploy MPC/HSM custody, chain indexers, reserve tiers, withdrawals, reconciliation, and drills.",
      },
      {
        name: "Compliance and live launch",
        percent: 7,
        evidence: "Launch gates comprehensively identify legal, identity, AML, custody, market, audit, and operational obligations.",
        next: "Assign accountable owners, implement controls, obtain legal approval, and record evidence.",
      },
      {
        name: "Live GEX/USDC market",
        percent: 3,
        evidence: "The market is designed and displayed, while real order submission and withdrawals remain deliberately disabled.",
        next: "Complete custody, liquidity, surveillance, disclosures, approval, and controlled launch.",
      },
    ],
  },
  {
    name: "Release and operations",
    description: "Distribution, testing, observability, security assurance, and production response.",
    features: [
      {
        name: "Cross-platform releases",
        percent: 78,
        evidence: "Signed CLI downloads and install paths exist for macOS, Linux, and Windows.",
        next: "Automate reproducible releases, provenance, rollback, and broader installation telemetry.",
      },
      {
        name: "Automated test coverage",
        percent: 62,
        evidence: "Core Rust and TypeScript projects include targeted protocol, policy, ledger, and interface tests.",
        next: "Add full-system, chaos, adversarial, custody, and upgrade-path coverage.",
      },
      {
        name: "Observability and status",
        percent: 52,
        evidence: "Genesis, coordinator, explorer, registry, node, service, and exchange status surfaces exist.",
        next: "Unify SLOs, alerts, incident timelines, historical uptime, and independent probes.",
      },
      {
        name: "Security audits and incident readiness",
        percent: 12,
        evidence: "Threat boundaries and launch gates are documented, but required external audits and rehearsals remain outstanding.",
        next: "Commission audits, operate a bug bounty, rehearse recovery, and publish remediation evidence.",
      },
    ],
  },
];

const allFeatures = featureGroups.flatMap((group) => group.features);
const overall = Math.round(
  allFeatures.reduce((sum, feature) => sum + feature.percent, 0) / allFeatures.length,
);

function average(features: Feature[]) {
  return Math.round(
    features.reduce((sum, feature) => sum + feature.percent, 0) / features.length,
  );
}

function readiness(percent: number) {
  if (percent >= 75) return "Operational foundation";
  if (percent >= 50) return "Working pilot";
  if (percent >= 25) return "Active build";
  if (percent >= 10) return "Early implementation";
  return "Concept and specification";
}

function barColor(percent: number) {
  if (percent >= 75) return "bg-emerald-300";
  if (percent >= 50) return "bg-cyan-300";
  if (percent >= 25) return "bg-amber-300";
  return "bg-rose-300";
}

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="section-label">Build status · August 2, 2026</p>
          <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <h1 className="max-w-5xl text-[clamp(4rem,10vw,9rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-foreground">
                Honest by
                <span className="block text-cyan-300">percentage.</span>
              </h1>
              <p className="mt-9 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                A repository-backed assessment of what works, what is operating as a
                pilot, and what still stands between GRID and production-scale,
                real-value use.
              </p>
            </div>

            <div className="border border-cyan-300/35 bg-cyan-300/[0.06] p-7">
              <p className="font-mono text-xs tracking-[0.18em] text-cyan-300 uppercase">
                Overall maturity
              </p>
              <p className="mt-5 text-7xl font-semibold tracking-[-0.06em] text-foreground">
                {overall}%
              </p>
              <p className="mt-4 text-sm leading-6 text-muted">
                Simple average across {allFeatures.length} independently scored
                features. This is a maturity index—not a launch date.
              </p>
            </div>
          </div>
        </div>
      </header>

      <ServiceStatusBoard />

      <section className="border-t border-foreground/10 px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-px bg-foreground/10 md:grid-cols-3">
            {[
              ["What raises a score", "Implemented code, passing tests, deployed pilots, recovery paths, and direct evidence."],
              ["What limits a score", "Single-party trust, devnet-only behavior, disabled value movement, missing audits, or incomplete operations."],
              ["What 100% means", "The defined feature is implemented, independently verified, operated safely, documented, and recoverable—not that it can never improve."],
            ].map(([title, copy]) => (
              <article key={title} className="bg-background p-7">
                <h2 className="font-mono text-xs tracking-[0.16em] text-cyan-300 uppercase">
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {featureGroups.map((group, groupIndex) => {
        const groupAverage = average(group.features);
        return (
          <section
            key={group.name}
            className="border-t border-foreground/10 px-5 py-20 sm:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
                <div>
                  <p className="font-mono text-xs tracking-[0.18em] text-cyan-300/75 uppercase">
                    {String(groupIndex + 1).padStart(2, "0")} · {groupAverage}%
                  </p>
                  <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
                    {group.name}
                  </h2>
                  <p className="mt-6 max-w-lg text-base leading-7 text-muted">
                    {group.description}
                  </p>
                  <div className="mt-8 h-1.5 overflow-hidden bg-foreground/10">
                    <div
                      className={`h-full ${barColor(groupAverage)}`}
                      style={{ width: `${groupAverage}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-foreground/15">
                  {group.features.map((feature) => (
                    <article
                      key={feature.name}
                      className="grid gap-5 border-b border-foreground/15 py-7 sm:grid-cols-[1fr_6rem]"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            {feature.name}
                          </h3>
                          <span className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                            {readiness(feature.percent)}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted">
                          <strong className="font-medium text-foreground/80">Evidence:</strong>{" "}
                          {feature.evidence}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          <strong className="font-medium text-foreground/80">Next:</strong>{" "}
                          {feature.next}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                          {feature.percent}%
                        </p>
                        <div className="mt-3 h-1.5 overflow-hidden bg-foreground/10">
                          <div
                            className={`h-full ${barColor(feature.percent)}`}
                            style={{ width: `${feature.percent}%` }}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section className="border-t border-foreground/10 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl border border-foreground/15 bg-foreground/[0.025] p-7 sm:p-10">
          <p className="section-label">Assessment note</p>
          <h2 className="mt-5 max-w-4xl text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl">
            Progress is not the same as permission to launch.
          </h2>
          <p className="mt-6 max-w-4xl text-base leading-8 text-muted">
            These percentages are an engineering assessment based on repository code,
            tests, public pilot behavior, documented safety boundaries, disabled
            production flags, and explicit launch gates. They are judgment calls—not
            financial claims, uptime guarantees, audit opinions, or regulatory
            approvals. Scores should change only when new evidence changes readiness.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
