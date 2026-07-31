import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "GRID vs Bitcoin, Ethereum, Solana & Dogecoin",
  description:
    "A feature-by-feature comparison of GRID and four established public blockchain networks.",
};

type Mark = "yes" | "pilot" | "no";

type ComparisonRow = {
  feature: string;
  detail: string;
  grid: Mark | string;
  ethereum: Mark | string;
  bitcoin: Mark | string;
  solana: Mark | string;
  dogecoin: Mark | string;
};

const rows: ComparisonRow[] = [
  {
    feature: "Native useful-compute rewards",
    detail: "Protocol rewards tied to verified compute-job receipts",
    grid: "yes",
    ethereum: "no",
    bitcoin: "no",
    solana: "no",
    dogecoin: "no",
  },
  {
    feature: "Proof-of-Resource scoring",
    detail: "Compute, uptime, efficiency, fidelity, and reputation inputs",
    grid: "yes",
    ethereum: "no",
    bitcoin: "no",
    solana: "no",
    dogecoin: "no",
  },
  {
    feature: "Compute-job coordinator",
    detail: "Native claim, verification, receipt, and settlement workflow",
    grid: "yes",
    ethereum: "no",
    bitcoin: "no",
    solana: "no",
    dogecoin: "no",
  },
  {
    feature: "Signed compute settlements",
    detail: "Verified receipts committed into inspectable signed blocks",
    grid: "yes",
    ethereum: "no",
    bitcoin: "no",
    solana: "no",
    dogecoin: "no",
  },
  {
    feature: "Hourly compute-emission ceiling",
    detail: "A hard controller limit rather than an estimated issuance rate",
    grid: "25,000 GRID",
    ethereum: "no",
    bitcoin: "no",
    solana: "no",
    dogecoin: "no",
  },
  {
    feature: "Dedicated compute allocation",
    detail: "Supply reserved specifically for verified network work",
    grid: "5B GRID",
    ethereum: "no",
    bitcoin: "no",
    solana: "no",
    dogecoin: "no",
  },
  {
    feature: "Privacy-preserving public node map",
    detail: "Quantized geography and public IDs; IP addresses are not published",
    grid: "yes",
    ethereum: "no",
    bitcoin: "no",
    solana: "no",
    dogecoin: "no",
  },
  {
    feature: "Hard total supply policy",
    detail: "A protocol-level maximum rather than dynamically changing supply",
    grid: "10B plan",
    ethereum: "Dynamic",
    bitcoin: "21M BTC",
    solana: "Inflation schedule",
    dogecoin: "Annual issuance",
  },
  {
    feature: "General-purpose smart contracts",
    detail: "User-deployed on-chain application programs",
    grid: "no",
    ethereum: "yes",
    bitcoin: "Limited script",
    solana: "yes",
    dogecoin: "no",
  },
  {
    feature: "Permissionless block production",
    detail: "An open validator or miner set chooses and finalizes blocks",
    grid: "pilot",
    ethereum: "yes",
    bitcoin: "yes",
    solana: "yes",
    dogecoin: "yes",
  },
  {
    feature: "Production mainnet history",
    detail: "A mature public chain securing real economic activity",
    grid: "pilot",
    ethereum: "yes",
    bitcoin: "yes",
    solana: "yes",
    dogecoin: "yes",
  },
  {
    feature: "Native consensus model",
    detail: "How the network currently orders and validates blocks",
    grid: "Genesis-signed + P2P verification",
    ethereum: "Proof of Stake",
    bitcoin: "Proof of Work",
    solana: "PoS + Proof of History",
    dogecoin: "Scrypt Proof of Work",
  },
];

const networks = [
  {
    name: "GRID",
    role: "Useful-compute network",
    accent: "border-emerald-400/40 bg-emerald-400/[0.06]",
  },
  { name: "Ethereum", role: "Programmable settlement", accent: "border-white/10" },
  { name: "Bitcoin", role: "Digital settlement asset", accent: "border-white/10" },
  { name: "Solana", role: "High-throughput programs", accent: "border-white/10" },
  { name: "Dogecoin", role: "Peer-to-peer currency", accent: "border-white/10" },
];

function Value({ value, grid = false }: { value: Mark | string; grid?: boolean }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center gap-2 font-medium text-emerald-400">
        <span className="grid size-5 place-items-center rounded-full bg-emerald-400/15">✓</span>
        Yes
      </span>
    );
  }
  if (value === "pilot") {
    return (
      <span className="inline-flex items-center gap-2 text-cyan-200">
        <span className="size-2 rounded-full bg-cyan-300" />
        Pilot
      </span>
    );
  }
  if (value === "no") return <span className="compare-no-marker">—</span>;
  return <span className={grid ? "font-medium text-emerald-300" : "text-white/55"}>{value}</span>;
}

export default function ComparePage() {
  return (
    <main className="compare-page min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="section-label">Network comparison</p>
          <h1 className="mt-6 max-w-6xl text-[clamp(3.4rem,9vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-white">
            Built for work,
            <br />
            <span className="text-emerald-300">not just transactions.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/50 sm:text-xl">
            Bitcoin secures payments. Ethereum and Solana run programs. Dogecoin
            moves currency. GRID is being built to verify useful compute and turn
            signed work receipts into a transparent settlement record.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#table" className="btn-primary">Compare features</a>
            <a href="/explorer" className="btn-ghost">Verify GRID live</a>
          </div>
        </div>
      </header>

      <section className="border-t border-white/10 px-5 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {networks.map((network) => (
            <article key={network.name} className={`border p-5 ${network.accent}`}>
              <p className={`text-xl font-semibold ${network.name === "GRID" ? "text-emerald-300" : "text-white"}`}>
                {network.name}
              </p>
              <p className="mt-2 text-sm text-white/40">{network.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="table" className="border-t border-white/10 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="section-label">Feature matrix</p>
            <h2 className="section-title mt-5">Different networks. Different jobs.</h2>
            <p className="section-body mt-6">
              A check means the capability is native and available today. “Pilot”
              marks GRID capabilities that still depend on the current Genesis-led
              development network.
            </p>
          </div>

          <div className="compare-table-shell overflow-x-auto border border-white/10 bg-black/20">
            <table className="w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="w-[28%] px-5 py-5 font-mono text-[0.65rem] tracking-[0.16em] text-white/40 uppercase">
                    Capability
                  </th>
                  {networks.map((network) => (
                    <th
                      key={network.name}
                      className={`px-5 py-5 font-mono text-[0.7rem] tracking-[0.12em] uppercase ${
                        network.name === "GRID" ? "compare-grid-cell bg-emerald-400/[0.07] text-emerald-300" : "text-white/55"
                      }`}
                    >
                      {network.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.feature} className="border-b border-white/[0.08] last:border-0">
                    <th className="px-5 py-5 align-top">
                      <span className="block text-sm font-medium text-white">{row.feature}</span>
                      <span className="mt-2 block max-w-sm text-xs font-normal leading-relaxed text-white/35">
                        {row.detail}
                      </span>
                    </th>
                    <td className="compare-grid-cell bg-emerald-400/[0.045] px-5 py-5 align-top text-sm">
                      <Value value={row.grid} grid />
                    </td>
                    <td className="px-5 py-5 align-top text-sm"><Value value={row.ethereum} /></td>
                    <td className="px-5 py-5 align-top text-sm"><Value value={row.bitcoin} /></td>
                    <td className="px-5 py-5 align-top text-sm"><Value value={row.solana} /></td>
                    <td className="px-5 py-5 align-top text-sm"><Value value={row.dogecoin} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className="panel p-7">
              <p className="section-label">Where GRID leads</p>
              <h3 className="mt-4 text-2xl font-light text-white">Compute-native accounting.</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/45">
                GRID’s differentiator is the end-to-end work path: node heartbeat,
                job claim, independent verification, capped emission, signed block,
                and wallet claim. The established chains compared here were designed
                around payments, stake, or general on-chain programs—not this native workflow.
              </p>
            </article>
            <article className="panel p-7">
              <p className="section-label">Where GRID is early</p>
              <h3 className="mt-4 text-2xl font-light text-white">Mainnet consensus.</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/45">
                GRID currently uses a Genesis-led signed chain with independent P2P
                verification. It does not yet match the open validator/miner sets,
                economic finality, liquidity, or operating history of the four
                production networks. Those are release gates, not hidden assumptions.
              </p>
            </article>
          </div>

          <div className="mt-10 border-t border-white/10 pt-7">
            <p className="font-mono text-[0.62rem] tracking-[0.16em] text-white/30 uppercase">
              Primary references · checked July 2026
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/45">
              <a className="hover:text-white" href="https://ethereum.org/developers/docs/consensus-mechanisms/pos/">Ethereum PoS ↗</a>
              <a className="hover:text-white" href="https://ethereum.org/developers/docs/smart-contracts/">Ethereum contracts ↗</a>
              <a className="hover:text-white" href="https://bitcoin.org/en/bitcoin-core/features/validation">Bitcoin validation ↗</a>
              <a className="hover:text-white" href="https://developer.bitcoin.org/devguide/block_chain.html">Bitcoin PoW ↗</a>
              <a className="hover:text-white" href="https://solana.com/docs/core/programs">Solana programs ↗</a>
              <a className="hover:text-white" href="https://solana.com/solana-whitepaper.pdf">Solana architecture ↗</a>
              <a className="hover:text-white" href="https://dogecoin.com/dogepedia/faq/putting-a-cap-on-dogecoin/">Dogecoin issuance ↗</a>
            </div>
            <p className="mt-5 max-w-4xl text-xs leading-relaxed text-white/30">
              This is a product-capability comparison, not an investment ranking.
              Network designs and protocol status change; “—” means the exact
              native GRID feature is not part of that base protocol, not that an
              external application could never approximate it.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
