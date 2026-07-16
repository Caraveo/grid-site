const pillars = [
  {
    title: "Resource Layer",
    body: "Heterogeneous hardware — consumer GPUs, workstations, racks, and surplus enterprise capacity — joins as autonomous nodes.",
  },
  {
    title: "Coordination",
    body: "Jobs shard across the mesh. Proximity, capability, and availability decide where work lands.",
  },
  {
    title: "Verification",
    body: "Results are checked. Fidelity, uptime, and completed work feed reputation — and rewards.",
  },
  {
    title: "Settlement",
    body: "GRID meters compute. Bitcoin is the Transact Security Layer for hard settlement when you cash out.",
  },
];

import { ScrambleText } from "./ScrambleText";

export function Network() {
  return (
    <section
      id="network"
      className="relative overflow-hidden border-t border-white/10 px-5 py-28 sm:py-36"
    >
      {/* Soft vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="section-label">
            <ScrambleText text="The Network" />
          </p>
          <h2 className="section-title mt-5">
            One <ScrambleText text="fabric." />
            <br />
            Infinite <ScrambleText text="edges." />
          </h2>
          <p className="section-body mt-6">
            GRID abstracts millions of machines into a unified computational environment.
            You keep control of power, heat, and schedule. The network only takes what you allow.
          </p>
        </div>

        <div className="mt-16 grid gap-px bg-white/10 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="bg-black p-8 sm:p-10 transition hover:bg-white/[0.03]"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-white/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                  <ScrambleText text={p.title} />
                </h3>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        {/* Abstract stat strip */}
        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-12 lg:grid-cols-4">
          {[
            { v: "PoR", l: "Proof-of-Resource" },
            { v: "S / M / L", l: "Node classes" },
            { v: "BTC", l: "Transact Security" },
            { v: "Open", l: "Little miners first" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {s.v}
              </div>
              <div className="mt-2 text-[0.7rem] tracking-[0.18em] text-white/40 uppercase">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
