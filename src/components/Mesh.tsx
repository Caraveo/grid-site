import { ScrambleText } from "./ScrambleText";

const FLOW = [
  {
    k: "01",
    t: "Node",
    d: "A machine on the fabric. You set power, heat, and schedule. Autonomy stays local — the mesh only takes what you allow.",
  },
  {
    k: "02",
    t: "Compute",
    d: "A named capacity unit you own exclusively. Launch it (grid launch garage), announce free slots, become addressable as garage.",
  },
  {
    k: "03",
    t: "Host",
    d: "Pull useful container_work. Jobs run fully isolated — no host mounts, cap-drop ALL, resource limits. Higher earn path.",
  },
  {
    k: "04",
    t: "Mine",
    d: "Proof-of-Resource security work (blake3_work). Coordinator re-computes the digest. Credits land in your local earn ledger.",
  },
  {
    k: "05",
    t: "Registry",
    d: "grid-compute.com lists peers and computes by name and capacity only — never IPs, ports, or endpoints. Location, not attack surface.",
  },
  {
    k: "06",
    t: "MESH",
    d: "The browser for the mesh. Type a compute label. Default scheme is grid://. Same mental model as the CLI: garage ↔ grid://garage.grid.",
  },
];

const RESOLVE = [
  { step: "1", label: "Built-ins", hint: "home · registry · status · help" },
  { step: "2", label: "Local names", hint: "~/.grid/browser/names.toml" },
  { step: "3", label: "Public registry", hint: "computes + free slots" },
  { step: "4", label: "Gateway", hint: "optional GRID_GATEWAY_URL" },
];

export function Mesh() {
  return (
    <section
      id="mesh"
      className="relative overflow-hidden border-t border-white/10 px-5 py-28 sm:py-36 lg:py-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">
            <ScrambleText text="For those that Know…" />
          </p>
          <h2 className="section-title mt-5">
            Download <ScrambleText text="MESH" />
          </h2>
          <p className="mx-auto mt-6 section-body text-center">
            MESH is the browser for the GRID mesh. Nodes host named computes.
            The registry publishes capacity. You open{" "}
            <span className="font-mono text-white/80">grid://</span> the way
            the old web opened https — except the primary network is compute.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://github.com/Caraveo/grid-net"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary min-w-[200px]"
            >
              Get MESH →
            </a>
            <a href="#download" className="btn-ghost min-w-[200px]">
              Node CLI
            </a>
          </div>
        </div>

        {/* Address model */}
        <div className="mx-auto mt-16 max-w-3xl border border-white/15 bg-white/[0.03] p-8 sm:p-10">
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-white/45 uppercase">
            Address model
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            Type a compute name. No extension required.
          </h3>
          <div className="mt-6 overflow-x-auto border border-white/10 bg-black/60 p-5 font-mono text-xs leading-relaxed text-white/70 sm:text-sm">
            <p>
              <span className="text-white/40">x</span>
              <span className="mx-3 text-white/25">→</span>
              <span className="text-white">grid://x.grid/</span>
            </p>
            <p className="mt-2">
              <span className="text-white/40">garage</span>
              <span className="mx-3 text-white/25">→</span>
              <span className="text-white">grid://garage.grid/</span>
            </p>
            <p className="mt-2">
              <span className="text-white/40">grid launch garage</span>
              <span className="mx-3 text-white/25">↔</span>
              <span className="text-white">browser: garage</span>
            </p>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/45">
            MESH claims the{" "}
            <span className="font-mono text-white/70">grid://</span> scheme on
            macOS, Windows, and Linux so system links open the mesh browser —
            not a legacy tab.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="section-label">
                <ScrambleText text="How it works" />
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Nodes. Computes. Verified work.
              </h3>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/45 lg:text-right">
              GRID runs the fabric. MESH is how you navigate it. Together they
              turn idle iron into addressable, earnable capacity.
            </p>
          </div>

          <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((item) => (
              <div
                key={item.k}
                className="bg-black p-6 transition hover:bg-white/[0.03] sm:p-8"
              >
                <span className="font-mono text-[0.65rem] tracking-widest text-white/35">
                  {item.k}
                </span>
                <h4 className="mt-3 text-sm font-semibold tracking-wide uppercase">
                  <ScrambleText text={item.t} />
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Resolve pipeline + run loop */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="panel p-6 sm:p-8">
            <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-white/40 uppercase">
              MESH resolve order
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              When you type a bare label, MESH walks this path until something
              answers:
            </p>
            <ol className="mt-6 space-y-4">
              {RESOLVE.map((r) => (
                <li key={r.step} className="flex items-start gap-4">
                  <span className="font-mono text-xs text-white/30 pt-0.5">
                    {r.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white/85">{r.label}</p>
                    <p className="mt-0.5 font-mono text-xs text-white/40">
                      {r.hint}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel p-6 sm:p-8">
            <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-white/40 uppercase">
              Node loop · three terminals
            </p>
            <div className="mt-5 overflow-x-auto border border-white/10 bg-black/60 p-5 font-mono text-xs leading-relaxed text-white/70 sm:text-sm">
              <p className="text-white/35"># coordinator (jobs + PoR)</p>
              <p>
                <span className="text-white/40">$</span> grid coord
              </p>
              <p className="mt-3 text-white/35"># name capacity, go public</p>
              <p>
                <span className="text-white/40">$</span> grid init --name garage
                --class S
              </p>
              <p>
                <span className="text-white/40">$</span> grid launch garage
                --public
              </p>
              <p>
                <span className="text-white/40">$</span> grid host
              </p>
              <p className="mt-3 text-white/35"># optional security mine</p>
              <p>
                <span className="text-white/40">$</span> grid mine
              </p>
              <p className="mt-3 text-white/35"># then open MESH</p>
              <p>
                <span className="text-white/40">$</span>{" "}
                <span className="text-white">garage</span>
                <span className="text-white/35"> → grid://garage.grid</span>
              </p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/40">
              Host path needs Docker (or Colima). Containers are isolated from
              the host. Public announces hit the registry; MESH reads the same
              feed.
            </p>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-16 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
          {[
            {
              t: "GRID",
              d: "Node CLI — host useful work, mine PoR, earn.",
              href: "https://github.com/Caraveo/grid",
            },
            {
              t: "MESH",
              d: "Browser for grid:// — the primary web of compute.",
              href: "https://github.com/Caraveo/grid-net",
            },
            {
              t: "Registry",
              d: "Public names + capacity. No IPs stored.",
              href: "/registry",
            },
          ].map((item) => (
            <a
              key={item.t}
              href={item.href}
              {...(item.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group block"
            >
              <p className="text-sm font-semibold tracking-[0.18em] uppercase transition group-hover:text-white">
                {item.t}
                <span className="ml-2 text-white/30 transition group-hover:text-white/70">
                  →
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                {item.d}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
