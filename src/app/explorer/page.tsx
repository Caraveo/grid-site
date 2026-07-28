import type { Metadata } from "next";
import { ExplorerDashboard } from "@/components/ExplorerDashboard";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "GRID Explorer | Live network telemetry",
  description:
    "Live GRID Genesis, signed-chain, coordinator, mining, settlement, and peer-mesh telemetry.",
};

export default function ExplorerPage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <section className="px-5 pb-24 pt-32 sm:pt-40">
        <div className="mx-auto max-w-7xl">
          <p className="section-label">GRID network explorer</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="section-title max-w-5xl">
                Every peer. Every proof. Every signed block.
              </h1>
              <p className="section-body mt-6 max-w-3xl">
                One public view across the Genesis Node, Blockchain Coordinator,
                Proof-of-Resource Mining, Signed Settlement Chain, and Privacy-Preserving
                Node Pings.
              </p>
            </div>
            <div className="rounded-full border border-border px-4 py-2 font-mono text-[0.65rem] tracking-[0.15em] text-muted uppercase">
              Public · read-only
            </div>
          </div>
          <div className="mt-12">
            <ExplorerDashboard />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
