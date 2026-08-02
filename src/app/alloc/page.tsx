import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ScrambleText } from "@/components/ScrambleText";
import {
  FounderVestingDiagram,
  PurchaseFundingDiagram,
  SupplySplitDiagram,
  TreasuryBarDiagram,
} from "@/components/alloc/AllocationDiagrams";

export const metadata: Metadata = metadataFor("/alloc");

const buckets = [
  {
    amount: "5.00B",
    percent: "50%",
    title: "Compute mining",
    explanation:
      "Reserved for machines that complete verified GRID work. The emission controller may issue no more than 25,000 GRID per hour and no more than 5B over its lifetime. Unused hourly capacity is not automatically minted.",
    control: "On-chain emission controller · verified receipts · duplicate protection",
  },
  {
    amount: "500M",
    percent: "5%",
    title: "Network development and grants",
    explanation:
      "Funds open-source engineering, protocol integrations, developer tools, research, and grants that expand useful demand or compute supply. Releases should follow published milestones rather than unrestricted transfers.",
    control: "Milestone releases · public grants ledger · treasury multisig",
  },
  {
    amount: "750M",
    percent: "7.5%",
    title: "Security audits and operations",
    explanation:
      "Pays for independent audits, incident response, infrastructure, verification services, legal and compliance work, and the ordinary cost of operating the network safely.",
    control: "Annual budgets · vendor disclosure · treasury multisig",
  },
  {
    amount: "500M",
    percent: "5%",
    title: "Founder allocation",
    explanation:
      "Recognizes the founder's creation and long-term stewardship of GRID. Nothing vests during year one; the allocation then vests monthly over four years and cannot be unlocked early by the founder alone.",
    control: "1-year cliff · 4-year monthly vest · public vesting account",
  },
  {
    amount: "500M",
    percent: "5%",
    title: "Contributors",
    explanation:
      "Reserved for employees and long-term contributors who build the protocol, applications, ecosystem, and operations. Awards are earned under written agreements and multi-year vesting—not given as instantly liquid bonuses.",
    control: "Documented awards · vesting contracts · forfeiture of unvested grants",
  },
  {
    amount: "250M",
    percent: "2.5%",
    title: "Community launch programs",
    explanation:
      "Supports early node participation, education, public test programs, community events, and targeted adoption. Campaign rules and results should be published to prevent undisclosed insider distributions.",
    control: "Scheduled programs · eligibility rules · post-program reports",
  },
  {
    amount: "250M",
    percent: "2.5%",
    title: "Liquidity provisioning",
    explanation:
      "Reserved for transparent market liquidity when GRID reaches that stage. These tokens are market infrastructure—not founder proceeds—and should remain in disclosed liquidity or market-making accounts.",
    control: "Dedicated multisig · disclosed venues · inventory reporting",
  },
  {
    amount: "2.00B",
    percent: "20%",
    title: "Purchase Allocation",
    explanation:
      "Provides disclosed GRID inventory for approved Buy and Sell Commands, purchase access for Hodlers, and orderly settlement through GRID Transact and GEX. Its internal 1B GRID Exchange reserve is part of this 2B allocation—not an additional treasury bucket.",
    control: "Authenticated commands · live quotes · custody reconciliation · public inventory reporting",
  },
  {
    amount: "250M",
    percent: "2.5%",
    title: "Emergency reserve",
    explanation:
      "A limited reserve for severe security incidents, critical recovery, or continuity events that cannot wait for an ordinary budget cycle. It is not a general-purpose discretionary wallet.",
    control: "Higher signature threshold · time delay · incident disclosure",
  },
];

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`border-t border-white/10 px-5 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export default function AllocationPage() {
  return (
    <main className="allocation-page min-h-screen">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pt-36 pb-20 sm:pt-44 sm:pb-28">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="section-label">GRID allocation ledger</p>
          <h1 className="mt-6 max-w-5xl text-[clamp(3.8rem,11vw,9rem)] leading-[0.86] font-semibold tracking-[-0.06em] text-white">
            Every GRID counted.
          </h1>
          <ScrambleText
            text="10,000,000,000 MAXIMUM. NO MYSTERY BUCKET."
            className="mt-8 block font-mono text-xs tracking-[0.2em] text-[var(--allocation-blue)] sm:text-sm"
          />
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/50 sm:text-xl">
            Five billion for verified compute. Five billion for building, protecting,
            launching, and sustaining the network—with every treasury unit assigned a job.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#ledger" className="btn-primary">Read the ledger</a>
            <Link href="/token?view=1" className="btn-ghost">Token architecture</Link>
          </div>
        </div>
      </header>

      <Section id="ledger">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="section-label">The complete supply</p>
            <h2 className="section-title mt-5">Two halves. One hard ceiling.</h2>
            <p className="section-body mt-6">
              The planned mainnet supply can never exceed 10B GRID. Compute rewards
              and treasury allocations are separately bounded so neither can consume
              the other&apos;s share.
            </p>
          </div>
          <SupplySplitDiagram />
        </div>
      </Section>

      <Section>
        <p className="section-label">Inside the treasury</p>
        <h2 className="section-title mt-5 max-w-4xl">Five billion, fully assigned.</h2>
        <p className="section-body mt-6 mb-12">
          “Treasury” is an umbrella, not a blank check. Its eight top-level
          allocations total exactly 5B Chips. Internal reserves are controls within
          those allocations and are never counted twice.
        </p>
        <TreasuryBarDiagram />
      </Section>

      <Section id="purchase-allocation">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="section-label">Purchase Allocation · GRID Transact · GEX</p>
            <h2 className="section-title mt-5">Two billion GRID. Purchase-ready.</h2>
            <p className="section-body mt-6">
              Purchase Allocation assigns 2B GRID to approved Buy and Sell Commands,
              Hodler purchase ability, settlement inventory, and orderly exchange
              operations. It is funded from Network Development, Community Launch,
              and Liquidity—not newly minted supply.
            </p>
            <div className="mt-7 border-l-2 border-[var(--allocation-blue)] pl-5">
              <p className="font-mono text-xs tracking-[0.16em] text-white/35 uppercase">
                GRID Exchange reserve · contained control
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                The 1B GRID Exchange reserve is held inside the 2B Purchase Allocation.
                It supports disclosed inventory and market continuity, but it is not
                listed again in the 5B treasury total.
              </p>
            </div>
          </div>
          <PurchaseFundingDiagram />
        </div>
      </Section>

      <Section>
        <div className="mb-12 grid gap-7 sm:grid-cols-3">
          <div>
            <p className="font-mono text-3xl font-semibold text-white">10B</p>
            <p className="mt-2 text-xs tracking-[0.16em] text-white/35 uppercase">Maximum supply</p>
          </div>
          <div>
            <p className="font-mono text-3xl font-semibold text-white">25,000</p>
            <p className="mt-2 text-xs tracking-[0.16em] text-white/35 uppercase">Maximum mined per hour</p>
          </div>
          <div>
            <p className="font-mono text-3xl font-semibold text-white">~22.83y</p>
            <p className="mt-2 text-xs tracking-[0.16em] text-white/35 uppercase">5B at continuous maximum</p>
          </div>
        </div>

        <div className="border-t border-white/12">
          {buckets.map((bucket, index) => (
            <article
              key={bucket.title}
              className="grid gap-5 border-b border-white/12 py-8 lg:grid-cols-[4rem_9rem_1fr_1fr] lg:gap-8"
            >
              <span className="font-mono text-xs text-white/25">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-white">{bucket.amount}</p>
                <p className="mt-1 font-mono text-xs text-[var(--allocation-blue)]">{bucket.percent} total</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{bucket.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45">{bucket.explanation}</p>
              </div>
              <div className="border-l border-white/10 pl-5">
                <p className="text-[0.62rem] font-semibold tracking-[0.2em] text-white/30 uppercase">Release control</p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{bucket.control}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="section-label">Founder allocation</p>
            <h2 className="section-title mt-5">Visible. Earned over time.</h2>
            <p className="section-body mt-6">
              The founder allocation is stated plainly: 500M GRID, equal to 5% of
              maximum supply. Long vesting aligns stewardship with the network rather
              than creating an immediately liquid insider position.
            </p>
          </div>
          <FounderVestingDiagram />
        </div>
      </Section>

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          <article className="panel rounded-sm p-7 sm:p-9">
            <p className="section-label">What “allocated” means</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">A ceiling, not circulation.</h2>
            <p className="mt-5 text-sm leading-relaxed text-white/45">
              An allocation defines the maximum assigned to a purpose. It does not mean
              every token is immediately minted, unlocked, circulating, sold, or spent.
              Public reporting must distinguish each of those states.
            </p>
          </article>
          <article className="panel rounded-sm p-7 sm:p-9">
            <p className="section-label">Current status</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">Policy before mainnet.</h2>
            <p className="mt-5 text-sm leading-relaxed text-white/45">
              This page records the planned production allocation. GRID is native to the
              GRID blockchain, with Genesis as the authoritative ledger. Test balances
              have no economic value and are not counted as treasury, Purchase
              Allocation, GEX reserve, or founder distributions.
            </p>
          </article>
        </div>
      </Section>

      <Section className="text-center">
        <p className="section-label">Public accountability</p>
        <h2 className="section-title mx-auto mt-5 max-w-4xl">Count it. Lock it. Report it.</h2>
        <p className="section-body mx-auto mt-6">
          Mainnet wallets, vesting contracts, and multisig controls will be published
          before production distribution.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/token?view=1" className="btn-primary">Understand the token</Link>
          <Link href="/explain" className="btn-ghost">Explore GRID</Link>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
