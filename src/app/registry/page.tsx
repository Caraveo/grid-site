import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RegisterFlow } from "@/components/RegisterFlow";
import { ScrambleText } from "@/components/ScrambleText";

export const metadata: Metadata = {
  title: "Registry — GRID public node registration",
  description:
    "Register a public GRID compute name. Cash App only — payments to $Caraveo.",
};

export default function RegistryPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="min-h-screen pt-24 pb-24">
        <section className="relative px-5 pt-10 sm:pt-16">
          <div className="pointer-events-none absolute inset-0 hero-glow opacity-60" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="section-label">
              <ScrambleText text="Public registry" />
            </p>
            <h1 className="section-title mt-5">
              Register your{" "}
              <span className="font-thin">
                <ScrambleText text="node" />
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl section-body text-center">
              To appear on{" "}
              <span className="font-mono text-white/80">registry.grid</span> you
              must register a <strong className="text-white/80">node</strong>{" "}
              and/or <strong className="text-white/80">compute</strong>. Optional{" "}
              <strong className="text-white/80">IdentityKey</strong>, then{" "}
              <strong className="text-white/80">Cash App only</strong> payment to{" "}
              <span className="font-mono text-white">$Caraveo</span>.
            </p>
          </div>
        </section>

        <section className="relative mx-auto mt-14 max-w-3xl px-5">
          <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-6 sm:p-10">
            <RegisterFlow />
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                t: "1 · Name",
                d: "Pick an available grid:// name for your public compute.",
              },
              {
                t: "2 · Cash App",
                d: "Pay the fee to $Caraveo with the exact registration note.",
              },
              {
                t: "3 · Host",
                d: "After review, launch and host: grid launch · grid host.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-5"
              >
                <p className="font-mono text-[0.65rem] tracking-[0.18em] text-white/40 uppercase">
                  {x.t}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {x.d}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-xs leading-relaxed text-white/30">
            Registration fee is non-refundable once payment is submitted for
            review. Names that violate policy may be rejected. Location-only
            mesh data never includes IPs.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
