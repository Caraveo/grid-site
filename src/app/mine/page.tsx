import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { MiningDashboard } from "@/components/MiningDashboard";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = metadataFor("/mine");

export default function MinePage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <section className="px-5 pb-24 pt-36 sm:pt-44">
        <div className="mx-auto max-w-6xl">
          <p className="section-label">Useful mining · Solana devnet</p>
          <h1 className="section-title mt-5 max-w-4xl">
            Your work. Your wallet. Every reward accounted for.
          </h1>
          <p className="section-body mt-6 max-w-3xl">
            The GRID miner completes a verifiable proof-of-resource job, the coordinator
            checks the result and emission limits, then the issuer deposits devnet GRID
            into the configured Solana wallet. Rewards are capped per wallet, node, and
            network identity as well as by the 25,000 GRID global hourly ceiling.
          </p>

          <div className="my-14 grid items-center gap-4 font-mono text-xs text-muted sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <div className="panel p-5 text-center">GRID miner<br /><span className="text-foreground">verified work</span></div>
            <span className="text-center">→</span>
            <div className="panel p-5 text-center">Coordinator<br /><span className="text-foreground">quota + receipt</span></div>
            <span className="text-center">→</span>
            <div className="panel p-5 text-center">Solana wallet<br /><span className="text-foreground">devnet GRID</span></div>
          </div>

          <div className="mb-14 panel p-6 sm:p-8">
            <p className="font-mono text-xs tracking-wider text-muted uppercase">Start mining</p>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-black p-5 text-sm leading-7 text-white">
              <code>{`grid init --name my-node --class S
grid solana create
grid auth
grid mine`}</code>
            </pre>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Already have a Solana wallet? Use <span className="font-mono text-foreground">grid solana import YOUR_ADDRESS</span>.
              The CLI stores only that public address when imported.
            </p>
          </div>

          <MiningDashboard />
        </div>
      </section>
      <Footer />
    </main>
  );
}
