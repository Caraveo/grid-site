import { ScrambleText } from "./ScrambleText";

const phases = [
  {
    id: "0",
    name: "Phase 0",
    title: "Prepare",
    status: "done" as const,
    tagline: "Spec & social contract",
    body: "White paper, token design, Bitcoin as Transact Security Layer, letter to miners.",
    beats: ["Vision locked", "Token + TSL", "Miner-first rules"],
  },
  {
    id: "1",
    name: "Phase 1",
    title: "Ignition",
    status: "now" as const,
    tagline: "Rust fabric live",
    body: "Single binary: coordinator, node, submit. Verified jobs. PoR earn. Open source on GitHub.",
    beats: ["grid coord / node", "Allowlisted jobs", "curl install"],
  },
  {
    id: "2",
    name: "Phase 2",
    title: "Pilot",
    status: "next" as const,
    tagline: "Real fleets",
    body: "Home rigs and racks under live heat. Docker workloads. Edge software wallet shell.",
    beats: ["GPU jobs", "Operator dashboard", "Desktop wallet"],
  },
  {
    id: "3",
    name: "Phase 3",
    title: "Genesis Earn",
    status: "upcoming" as const,
    tagline: "Mainnet rewards",
    body: "Verified work settles into locked GRID. Emission on-rail. No public testnet economy.",
    beats: ["Token + locks", "Emission controller", "Mobile watch"],
  },
  {
    id: "4",
    name: "Phase 4+",
    title: "Planetary",
    status: "locked" as const,
    tagline: "Utility · edge · wallets",
    body: "Buyers spend for capacity. Marketplace exits to BTC. Web + service wallets at scale.",
    beats: ["Open utility", "Edge routing", "Full wallet suite"],
  },
];

const statusLabel: Record<(typeof phases)[number]["status"], string> = {
  done: "Complete",
  now: "Live now",
  next: "Next up",
  upcoming: "On deck",
  locked: "Locked",
};

export function Timeline() {
  return (
    <section
      id="timeline"
      className="relative overflow-hidden border-t border-white/10 px-5 py-28 sm:py-36 lg:py-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(255,255,255,0.06)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 border border-white/20 bg-white/[0.04] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-[0.65rem] font-semibold tracking-[0.28em] uppercase">
              Currently at Phase 1
            </span>
          </div>

          <h2 className="section-title mt-8">
            <ScrambleText text="Mainnet path." />
            <br />
            No <ScrambleText text="testnet" /> economy.
          </h2>
          <p className="mx-auto mt-6 section-body text-center">
            Software is live. The token economy is Genesis Earn → open utility —
            not a public testnet playground. Install now. Learn the fabric.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#download" className="btn-primary min-w-[200px]">
              Install GRID
            </a>
            <a href="#mesh-downloads" className="btn-ghost min-w-[200px]">
              Download Mesh
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-px bg-white/10 sm:grid-cols-3">
          {[
            { k: "Now", v: "Phase 1 · Ignition" },
            { k: "Action", v: "curl · coord · node" },
            { k: "Exit", v: "Bitcoin TSL" },
          ].map((item) => (
            <div
              key={item.k}
              className="bg-black px-6 py-5 text-center sm:text-left"
            >
              <div className="text-[0.6rem] tracking-[0.22em] text-white/35 uppercase">
                {item.k}
              </div>
              <div className="mt-1 text-sm font-semibold tracking-tight sm:text-base">
                {item.v}
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-20">
          <div className="pointer-events-none absolute top-0 bottom-0 left-[1.15rem] w-px bg-gradient-to-b from-white via-white/20 to-transparent md:top-8 md:right-0 md:left-0 md:h-px md:w-auto md:bg-gradient-to-r" />

          <ol className="relative space-y-6 md:grid md:grid-cols-5 md:gap-4 md:space-y-0">
            {phases.map((phase) => {
              const isNow = phase.status === "now";
              const isDone = phase.status === "done";
              return (
                <li key={phase.id} className="relative pl-12 md:pt-16 md:pl-0">
                  <div
                    className={`absolute top-1 left-0 flex h-9 w-9 items-center justify-center md:top-0 md:left-1/2 md:-translate-x-1/2 ${
                      isNow || isDone
                        ? "border border-white bg-white text-black"
                        : "border border-white/25 bg-black text-white/50"
                    }`}
                  >
                    <span className="font-mono text-xs font-semibold">
                      {phase.id === "4" ? "4+" : phase.id}
                    </span>
                  </div>

                  <div
                    className={`panel h-full p-5 md:p-6 ${
                      isNow
                        ? "border-white/40 bg-white/[0.06] ring-1 ring-white/20"
                        : "opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[0.6rem] tracking-[0.2em] text-white/40 uppercase">
                        {phase.name}
                      </span>
                      <span
                        className={`text-[0.55rem] font-semibold tracking-[0.14em] uppercase ${
                          isNow
                            ? "text-white"
                            : phase.status === "next"
                              ? "text-white/70"
                              : "text-white/30"
                        }`}
                      >
                        {statusLabel[phase.status]}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold tracking-tight">
                      <ScrambleText text={phase.title} />
                    </h3>
                    <p className="mt-1 text-[0.7rem] tracking-[0.12em] text-white/45 uppercase">
                      {phase.tagline}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/50">
                      {phase.body}
                    </p>

                    <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
                      {phase.beats.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-xs text-white/45"
                        >
                          <span
                            className={`mt-1.5 h-1 w-1 shrink-0 ${
                              isNow || isDone ? "bg-white" : "bg-white/30"
                            }`}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-16 border border-white/15 bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-10 text-center sm:px-12">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] text-white/50 uppercase">
            Phase 1 is open
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg font-medium tracking-tight text-white sm:text-xl">
            Run the coordinator. Run a node. Submit work.
            <span className="text-white/45">
              {" "}
              Early operators learn the fabric before open utility.
            </span>
          </p>
          <a href="#download" className="btn-primary mt-8 inline-flex">
            Download GRID · Phase 1
          </a>
        </div>
      </div>
    </section>
  );
}
