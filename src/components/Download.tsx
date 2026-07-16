const platforms = [
  {
    id: "macos",
    name: "macOS",
    arch: "Apple Silicon & Intel",
    status: "Build via curl",
  },
  {
    id: "linux",
    name: "Linux",
    arch: "x86_64 · aarch64",
    status: "Build via curl",
  },
  {
    id: "windows",
    name: "Windows",
    arch: "x86_64",
    status: "Source soon",
  },
];

const CURL =
  "curl -fsSL https://raw.githubusercontent.com/Caraveo/grid/master/scripts/install.sh | bash";

export function Download() {
  return (
    <section
      id="download"
      className="relative border-t border-white/10 px-5 py-28 sm:py-36 lg:py-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">Phase 1 · Install</p>
          <h2 className="section-title mt-5">Get GRID</h2>
          <p className="mx-auto mt-6 section-body text-center">
            One binary. Useful mining CLI. Install with curl, or build from
            source. Mainnet path only — no public testnet economy.
          </p>
        </div>

        {/* Primary CTA — curl */}
        <div className="mx-auto mt-14 max-w-3xl border border-white/15 bg-white/[0.03] p-8 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-white/45 uppercase">
                Available now
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Install with curl
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/50">
                Tries a prebuilt release when published; otherwise builds from
                source with cargo and installs to{" "}
                <span className="font-mono text-white/70">~/.local/bin</span>.
              </p>
            </div>
            <a
              href="https://github.com/Caraveo/grid"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary shrink-0"
            >
              GitHub →
            </a>
          </div>

          <div className="mt-8 overflow-x-auto border border-white/10 bg-black/60 p-5 font-mono text-xs leading-relaxed text-white/70 sm:text-sm">
            <p className="text-white/35"># install</p>
            <p className="break-all">
              <span className="text-white/40">$</span> {CURL}
            </p>
            <p className="mt-4 text-white/35"># run the fabric (3 terminals)</p>
            <p>
              <span className="text-white/40">$</span> grid coord
            </p>
            <p>
              <span className="text-white/40">$</span> grid init --name garage
              --class S
            </p>
            <p>
              <span className="text-white/40">$</span> grid node
            </p>
            <p>
              <span className="text-white/40">$</span> grid submit --wait
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {platforms.map((p) => (
            <div key={p.id} className="dl-card panel flex flex-col p-6">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.6rem] tracking-[0.12em] text-white/40 uppercase">
                  {p.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/40">{p.arch}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-lg text-center text-xs leading-relaxed text-white/35">
          Signed one-click binaries land when GitHub Releases publish{" "}
          <span className="font-mono">grid-&lt;os&gt;-&lt;arch&gt;</span>{" "}
          assets. Until then, curl builds from source.
        </p>
      </div>
    </section>
  );
}
