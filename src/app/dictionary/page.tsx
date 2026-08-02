import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { DictionaryExplorer } from "@/components/dictionary/DictionaryExplorer";
import { extraDictionaryTerms } from "@/lib/dictionary-extra";
import { metadataFor } from "@/lib/seo";

export const metadata: Metadata = metadataFor("/dictionary");

export type DictionaryTerm = {
  term: string;
  aka?: string;
  category: "Basics" | "Markets" | "Network" | "Security" | "GRID";
  definition: string;
  example: string;
  related?: string[];
};

const coreTerms: DictionaryTerm[] = [
  {
    term: "Airdrop",
    category: "Basics",
    definition: "A distribution of tokens or credits to eligible wallets, usually at no direct cost.",
    example: "A project sends 50 tokens to early test-network participants.",
    related: ["Bonó", "Faucet", "Snapshot"],
  },
  {
    term: "ATH",
    aka: "All-time high",
    category: "Markets",
    definition: "The highest recorded market price of an asset.",
    example: "If a CHIP previously peaked at $4, then $4 is its ATH.",
  },
  {
    term: "Bear market",
    category: "Markets",
    definition: "A sustained period of falling prices and weak market confidence.",
    example: "Traders reduce risk while prices trend downward for months.",
  },
  {
    term: "Block",
    category: "Network",
    definition: "A signed batch of transactions or state updates added to a blockchain.",
    example: "A GRID block can record verified receipts and ledger changes.",
  },
  {
    term: "Blockchain",
    category: "Network",
    definition: "A shared, ordered ledger whose history is linked and cryptographically verified.",
    example: "Independent peers verify the same sequence of signed blocks.",
  },
  {
    term: "Bonó",
    aka: "Bonus airdrop · GRID term",
    category: "GRID",
    definition: "A bonus distribution awarded to eligible participants without changing the meaning of mining rewards.",
    example: "Early operators receive a Bonó for completing a documented launch milestone.",
    related: ["Airdrop", "Mining", "GRID"],
  },
  {
    term: "Bridge",
    category: "Network",
    definition: "A system that transfers or represents assets between separate networks.",
    example: "Tokens are locked on one chain and represented on another.",
  },
  {
    term: "Bull market",
    category: "Markets",
    definition: "A sustained period of rising prices and strong market confidence.",
    example: "Demand and trading activity increase across many assets.",
  },
  {
    term: "Burn",
    category: "Basics",
    definition: "The permanent removal of tokens from usable supply.",
    example: "Tokens are sent to an address from which they cannot be spent.",
  },
  {
    term: "CHIP",
    aka: "GRID atomic unit",
    category: "GRID",
    definition: "The whole-number unit recorded by the native GRID ledger and used for exact accounting.",
    example: "A GEX reserve entry records 1,000,000,000 Chips with no decimal rounding.",
    related: ["GRID", "GEX", "Satoshi"],
  },
  {
    term: "CLI",
    aka: "Command-line interface",
    category: "GRID",
    definition: "A text-based tool for operating GRID, inspecting the network, managing wallets, and running node commands.",
    example: "An operator runs the GRID CLI to check peer status or start mining.",
  },
  {
    term: "Cold wallet",
    category: "Security",
    definition: "A wallet whose signing keys are kept offline or isolated from everyday network access.",
    example: "Treasury keys are stored on a disconnected hardware device.",
  },
  {
    term: "Consensus",
    category: "Network",
    definition: "The rules participants use to agree on valid state and its ordering.",
    example: "Peers reject a block that fails the network’s verification rules.",
  },
  {
    term: "Compute receipt",
    category: "GRID",
    definition: "A signed record showing that a specific compute job was completed and measured.",
    example: "GRID verifies a compute receipt before the work can contribute to a mining reward.",
  },
  {
    term: "Coordinator",
    category: "GRID",
    definition: "A service that assigns eligible compute jobs and coordinates claims, verification, receipts, and settlement.",
    example: "A node claims work from a coordinator and returns a signed result.",
  },
  {
    term: "Custody",
    category: "Security",
    definition: "Control over the keys or system capable of moving an asset.",
    example: "Self-custody means the holder controls the signing key.",
  },
  {
    term: "DAO",
    aka: "Decentralized autonomous organization",
    category: "Basics",
    definition: "A group that coordinates ownership or decisions through on-chain rules and voting.",
    example: "Token holders vote on how a community treasury is used.",
  },
  {
    term: "DeFi",
    aka: "Decentralized finance",
    category: "Basics",
    definition: "Financial tools delivered by blockchain programs rather than a traditional intermediary.",
    example: "A user swaps assets through an automated liquidity pool.",
  },
  {
    term: "DePIN",
    aka: "Decentralized physical infrastructure network",
    category: "Network",
    definition: "A network that coordinates real-world hardware or infrastructure using cryptographic incentives.",
    example: "Independent machines contribute compute capacity to a shared network.",
  },
  {
    term: "DYOR",
    aka: "Do your own research",
    category: "Security",
    definition: "A reminder to verify claims, risks, contracts, and sources before acting.",
    example: "Check the official contract address instead of trusting a social post.",
  },
  {
    term: "Fiat",
    category: "Markets",
    definition: "Government-issued currency such as the US dollar or euro.",
    example: "An exchange quotes a CHIP price in USD.",
  },
  {
    term: "Exchange",
    category: "Markets",
    definition: "A venue or system where participants buy, sell, or swap assets.",
    example: "An exchange matches a buyer’s bid with a seller’s asking price.",
  },
  {
    term: "Gas fee",
    category: "Network",
    definition: "A charge paid to process a transaction or execute an on-chain program.",
    example: "A wallet estimates the network fee before a transfer is signed.",
  },
  {
    term: "Genesis",
    category: "GRID",
    definition: "The authoritative starting state and first trusted history of the GRID ledger.",
    example: "Supply allocations originate from the documented Genesis state.",
    related: ["Genesis Node", "Ledger", "Block height"],
  },
  {
    term: "Genesis Node",
    category: "GRID",
    definition: "The authoritative GRID service that anchors signed ledger history and the network’s initial trust boundary.",
    example: "Peers verify signed state received from the Genesis Node before accepting it.",
    related: ["Genesis", "GRID Network", "Coordinator"],
  },
  {
    term: "GEX",
    aka: "GRID Exchange",
    category: "GRID",
    definition: "GRID’s exchange surface for disclosed CHIP inventory, liquidity, and market operations.",
    example: "A GEX balance is reconciled against the authoritative GRID ledger.",
    related: ["Exchange", "CHIP", "GRID"],
  },
  {
    term: "GRID",
    category: "GRID",
    definition: "The native unit of account and reward for GRID’s useful-compute network; exact ledger amounts are recorded in Chips.",
    example: "A node earns GRID after eligible useful work is verified.",
  },
  {
    term: "GRID Network",
    category: "GRID",
    definition: "The open compute fabric connecting nodes, peers, coordinators, wallets, registry names, and signed ledger history.",
    example: "Machines join the GRID Network to contribute capacity or verify public state.",
  },
  {
    term: "Hash",
    category: "Security",
    definition: "A fixed-length cryptographic fingerprint used to detect changes in data.",
    example: "Changing one byte produces a different block hash.",
  },
  {
    term: "Hot wallet",
    category: "Security",
    definition: "A wallet connected to a network for convenient, frequent transactions.",
    example: "A small operational balance is kept online for daily transfers.",
  },
  {
    term: "Liquidity",
    category: "Markets",
    definition: "How easily an asset can be bought or sold without sharply moving its price.",
    example: "A deeper order book can absorb a larger trade with less slippage.",
  },
  {
    term: "Market cap",
    category: "Markets",
    definition: "Market price multiplied by the circulating supply of an asset.",
    example: "Two million circulating units at $3 each imply a $6 million market cap.",
  },
  {
    term: "Mesh",
    aka: "GRID browser",
    category: "GRID",
    definition: "The desktop browser for opening grid:// realms and navigating services on the GRID Network.",
    example: "A user enters grid://fire.grid in Mesh instead of a conventional web address.",
  },
  {
    term: "Mining",
    category: "GRID",
    definition: "Earning network rewards by completing and verifying eligible useful work.",
    example: "A GRID node submits a signed receipt for a completed compute job.",
  },
  {
    term: "Node",
    category: "Network",
    definition: "A machine or process that participates in a distributed network.",
    example: "A GRID node shares capacity, verifies state, or performs useful compute.",
  },
  {
    term: "Oracle",
    category: "Network",
    definition: "A service that supplies external facts or measurements to an on-chain system.",
    example: "A program reads a signed market-price feed from an oracle.",
  },
  {
    term: "Phoenix",
    aka: "GRID wallet",
    category: "GRID",
    definition: "The native desktop wallet for GRID custody, rewards, transfers, and locally signed actions.",
    example: "Phoenix signs a GRID transfer using keys held in its encrypted local vault.",
    related: ["Wallet", "Private key", "GRID"],
  },
  {
    term: "Private key",
    category: "Security",
    definition: "Secret signing material that proves authority over a wallet or identity.",
    example: "Anyone with the private key may be able to move its funds.",
    related: ["Public key", "Seed phrase", "Digital signature"],
  },
  {
    term: "Proof of Resource",
    aka: "PoR · GRID",
    category: "GRID",
    definition: "GRID’s method for measuring and verifying useful computational work and contributed resources.",
    example: "A receipt is scored using work, uptime, efficiency, fidelity, and reputation signals.",
  },
  {
    term: "Public key",
    category: "Security",
    definition: "Shareable cryptographic material used to verify signatures or derive an address.",
    example: "Peers verify a signed receipt without learning the private key.",
  },
  {
    term: "Realm",
    category: "GRID",
    definition: "A named destination or service opened through a grid:// address in Mesh.",
    example: "grid://fire.grid identifies a realm on the GRID Network.",
  },
  {
    term: "Registry",
    category: "GRID",
    definition: "The public naming system that maps reviewed GRID names to entities, services, or network resources.",
    example: "A registered name gives a realm a stable identity that users can inspect.",
  },
  {
    term: "Seed phrase",
    category: "Security",
    definition: "A human-readable recovery secret capable of restoring a compatible wallet.",
    example: "Store it offline; never paste it into an unsolicited website.",
    related: ["Private key", "Recovery phrase", "Wallet"],
  },
  {
    term: "Slippage",
    category: "Markets",
    definition: "The difference between the expected trade price and the final execution price.",
    example: "A large market order fills across several prices and costs 1% more than expected.",
  },
  {
    term: "Smart contract",
    category: "Network",
    definition: "Code deployed to a blockchain that executes under that network’s rules.",
    example: "A contract releases funds after its stated conditions are met.",
  },
  {
    term: "Stablecoin",
    category: "Markets",
    definition: "A crypto asset designed to track another asset, commonly a fiat currency.",
    example: "A USD-linked stablecoin aims to remain near one US dollar.",
  },
  {
    term: "Tokenomics",
    category: "Basics",
    definition: "The supply, allocation, issuance, utility, and incentive design of a token.",
    example: "A tokenomics page explains maximum supply and vesting controls.",
  },
  {
    term: "Transaction",
    aka: "Tx",
    category: "Network",
    definition: "A signed instruction that requests a change to ledger state.",
    example: "A wallet signs a transaction that transfers 500 Chips.",
  },
  {
    term: "Validator",
    category: "Network",
    definition: "A participant that checks transactions or blocks against network rules.",
    example: "A validator rejects an invalid signature before accepting state.",
  },
  {
    term: "Vesting",
    category: "Basics",
    definition: "A schedule that unlocks an allocation gradually or after milestones.",
    example: "A contributor receives 25% of an award each year for four years.",
  },
  {
    term: "Wallet",
    category: "Security",
    definition: "Software or hardware that manages keys and signs actions; assets remain recorded on the ledger.",
    example: "Phoenix signs a GRID transfer from an encrypted local vault.",
  },
  {
    term: "Whale",
    category: "Markets",
    definition: "A holder whose large balance or trades may materially affect a market.",
    example: "A whale’s large sale consumes much of a thin order book.",
  },
];

const terms = [...coreTerms, ...extraDictionaryTerms];

export default function DictionaryPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="min-h-screen bg-background">
        <header className="hero-glow relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-32 sm:pb-20 sm:pt-40">
          <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-7xl">
            <p className="section-label">Crypto + GRID terminology</p>
            <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <h1 className="max-w-4xl text-[clamp(3.3rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                  The dictionary.
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                  Short definitions. Plain examples. Standard crypto language
                  alongside the terms GRID is adding to the conversation.
                </p>
              </div>
              <div className="flex gap-8 border-l border-border pl-6 font-mono">
                <div>
                  <p className="text-2xl font-semibold">{terms.length}</p>
                  <p className="mt-1 text-[0.62rem] tracking-[0.16em] text-dim uppercase">Terms</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">5</p>
                  <p className="mt-1 text-[0.62rem] tracking-[0.16em] text-dim uppercase">Groups</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <DictionaryExplorer terms={terms} />
      </main>
      <Footer />
    </>
  );
}
