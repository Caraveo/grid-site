import Link from "next/link";
import { ScrambleText } from "./ScrambleText";

const surfaces = [
  {
    title: "macOS",
    body: "Native SwiftUI wallet with system, light, and dark themes.",
    phase: "LIVE",
  },
  {
    title: "Windows",
    body: "Desktop wallet for GRID balances, rewards, transfers, and custody.",
    phase: "LIVE",
  },
  {
    title: "Linux",
    body: "AppImage and Debian packages backed by the native GRID wallet core.",
    phase: "LIVE",
  },
  {
    title: "GRID → SOL → BTC",
    body: "GRID management and Solana devnet rewards now; Bitcoin consolidation is the next audited gate.",
    phase: "ROADMAP",
  },
];

export function Wallets() {
  return (
    <section
      id="wallets"
      className="relative border-t border-white/10 px-5 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="section-label">
            <ScrambleText text="Edge wallets" />
          </p>
          <h2 className="section-title mt-5">
            <ScrambleText text="Keys" /> at the edge.
            <br />
            Exit on <ScrambleText text="Bitcoin." />
          </h2>
          <p className="section-body mt-6">
            Native desktop apps use the same encrypted vault, recovery phrase,
            grid0 address, and transaction workflow as the GRID command line.
          </p>
          <Link href="/phoenix" className="btn-primary mt-8">
            Download GRID Wallet
          </Link>
        </div>

        <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {surfaces.map((s) => (
            <div
              key={s.title}
              className="bg-black p-8 transition hover:bg-white/[0.03]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  <ScrambleText text={s.title} />
                </h3>
                <span className="font-mono text-[0.6rem] tracking-[0.14em] text-cyan-200/55 uppercase">
                  {s.phase}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/50">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
