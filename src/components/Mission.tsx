import { ScrambleText } from "./ScrambleText";

export function Mission() {
  return (
    <section
      id="mission"
      className="relative border-t border-white/10 px-5 py-28 sm:py-36 lg:py-44"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="section-label">
            <ScrambleText text="Mission" />
          </p>
          <h2 className="section-title mt-5">
            <ScrambleText text="Compute" />
            <br />
            without
            <br />
            <ScrambleText text="walls." />
          </h2>
        </div>

        <div className="flex flex-col justify-end gap-8 lg:col-span-7">
          <p className="section-body text-base sm:text-lg">
            The world&apos;s largest supercomputer will not be built in one place.
            It will emerge from millions of connected machines — garages, racks,
            datacenters, and edge devices — working as one fabric.
          </p>
          <p className="section-body text-base sm:text-lg">
            GRID measures real contribution. Not puzzles that burn power to prove
            you burned power —{" "}
            <ScrambleText
              text="verified useful work"
              className="text-white"
            />
            : AI jobs, frames, simulation, and the latency-critical worlds still
            coming.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { k: "01", t: "Measure", d: "Proof-of-Resource scores real capacity." },
              { k: "02", t: "Coordinate", d: "Work routes to machines that can finish it." },
              { k: "03", t: "Reward", d: "Verified output earns GRID. Exit on your terms." },
            ].map((item) => (
              <div key={item.k} className="panel p-5">
                <span className="font-mono text-[0.65rem] tracking-widest text-white/35">
                  {item.k}
                </span>
                <h3 className="mt-3 text-sm font-semibold tracking-wide uppercase">
                  <ScrambleText text={item.t} />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
