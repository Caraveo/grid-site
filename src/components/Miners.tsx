import { ScrambleText } from "./ScrambleText";

export function Miners() {
  return (
    <section
      id="miners"
      className="relative border-t border-white/10 px-5 py-28 sm:py-36 lg:py-44"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="section-label">
              <ScrambleText text="For Miners" />
            </p>
            <h2 className="section-title mt-5">
              Keep <ScrambleText text="mining." />
              <br />
              Mine <ScrambleText text="useful." />
            </h2>
            <p className="section-body mt-6">
              You already did the hard part — the iron, the power, the discipline.
              GRID re-aims that craft at verified compute. Same rooms. Same culture.
              A market that buys capacity.
            </p>

            <ul className="mt-10 space-y-5">
              {[
                "One card in a small form factor — you belong here.",
                "A rack that used to hum for ETH — you belong here.",
                "A datacenter with surplus capacity — you belong too.",
              ].map((line) => (
                <li key={line} className="flex gap-4 text-sm text-white/65 sm:text-base">
                  <span className="mt-2 h-px w-6 shrink-0 bg-white/30" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="relative flex flex-col justify-center border border-white/10 bg-white/[0.02] p-8 sm:p-12">
            <div className="pointer-events-none absolute -top-3 left-8 bg-black px-3 font-mono text-xs tracking-[0.3em] text-white/30">
              LETTER
            </div>
            <p className="text-lg leading-relaxed text-white/80 sm:text-xl sm:leading-relaxed">
              &ldquo;You are not idle capacity. You are not a footnote in someone
              else&apos;s cloud. You are how a planetary computer stays human-scale,
              geographically real, and hard to capture.&rdquo;
            </p>
            <footer className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-sm tracking-[0.15em] text-white/45 uppercase">
                — GRID
              </span>
              <a
                href="#download"
                className="text-[0.7rem] tracking-[0.15em] text-white/50 uppercase transition hover:text-white"
              >
                Install GRID →
              </a>
            </footer>
          </blockquote>
        </div>

        {/* Flow */}
        <div className="mt-24">
          <p className="section-label text-center">
            <ScrambleText text="How you join" />
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Install",
                body: "Get the GRID binary. One lightweight client. Your machine, your limits.",
              },
              {
                step: "02",
                title: "Run a node",
                body: "Set power and thermal bounds. Contribute what you choose — nothing more.",
              },
              {
                step: "03",
                title: "Earn GRID",
                body: "Verified work pays. Sell it, stack it, or settle value through Bitcoin.",
              },
            ].map((s) => (
              <div key={s.step} className="panel relative p-8 text-center">
                <div className="font-mono text-xs tracking-[0.3em] text-white/30">
                  {s.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  <ScrambleText text={s.title} />
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/50">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
