import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ScrambleText } from "@/components/ScrambleText";
import { EmberDownload } from "@/components/EmberDownload";

export const metadata: Metadata = {
  title: "Ember | The GRID wallet",
  description: "Download Ember, the native wallet for GRID, Solana rewards, and the path to Bitcoin settlement.",
};

export default function EmberPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-16 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 hero-glow" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-80" />
        <section className="relative mx-auto max-w-2xl py-24 text-center sm:py-32">
          <p className="section-label">
            <ScrambleText text="Ember" />
          </p>
          <h1 className="mt-5 text-[clamp(2.75rem,9vw,5.5rem)] font-semibold leading-none tracking-[-0.04em]">
            Hold the spark.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted">
            One native wallet for GRID custody, Solana mining rewards, and the
            audited path toward Bitcoin settlement.
          </p>
          <EmberDownload />
        </section>
      </main>
      <Footer />
    </>
  );
}
