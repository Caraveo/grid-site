import { ScrambleText } from "./ScrambleText";
import { DOWNLOADS } from "@/lib/downloads";
import { MeshDownloads } from "./MeshDownloads";

const FLOW = [
  {
    k: "01",
    t: "Node",
    d: "A machine on the fabric. You set power, heat, and schedule. Autonomy stays local — the mesh only takes what you allow.",
  },
  {
    k: "02",
    t: "Compute",
    d: "A named capacity unit you own. Launch it, go public, become addressable as a realm on the mesh.",
  },
  {
    k: "03",
    t: "Realm",
    d: "Type a name in Mesh. No extension required. garage becomes grid://garage.grid — like a domain for compute.",
  },
  {
    k: "04",
    t: "Host",
    d: "Serve useful work from your machine. Isolated capacity. The fabric routes jobs to ready nodes.",
  },
  {
    k: "05",
    t: "Registry",
    d: "Public names and capacity on grid-compute.com — never IPs, ports, or endpoints. Location, not attack surface.",
  },
  {
    k: "06",
    t: "Mesh",
    d: "The desktop browser for the mesh. Open grid:// the way the old web opened https — primary network is compute.",
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
            <ScrambleText text="Mesh · Desktop browser" />
          </p>
          <h2 className="section-title mt-5">
            Download <ScrambleText text="Mesh" />
          </h2>
          <p className="mx-auto mt-6 section-body text-center">
            Mesh is the desktop app for the GRID mesh. Type a realm. Open{" "}
            <span className="font-mono text-white/80">grid://</span> the way the
            old web opened https — the primary network is compute.
          </p>
          <p className="mt-4 font-mono text-[0.65rem] tracking-[0.18em] text-white/35 uppercase">
            v{DOWNLOADS.mesh.version} · auto-detects your machine
          </p>
        </div>

        {/* Smart downloads — best build for this browser */}
        <MeshDownloads />

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-white/35">
          Your browser picks the best Mesh build (OS + architecture). All
          packages live on{" "}
          <span className="font-mono text-white/45">
            grid-compute.com/downloads/mesh
          </span>
          . Need the node CLI?{" "}
          <a
            href="#download"
            className="text-white/55 underline-offset-2 hover:underline"
          >
            GRID CLI
          </a>
          .
        </p>

        {/* Realms */}
        <div className="mx-auto mt-16 max-w-3xl border border-white/15 bg-white/[0.03] p-8 sm:p-10">
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-white/45 uppercase">
            Realms
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            Type a realm. No extension required.
          </h3>
          <p className="mt-3 text-sm text-white/45">
            On the web: domains. In Mesh:{" "}
            <span className="text-white/75">realms</span>.
          </p>
          <div className="mt-6 overflow-x-auto border border-white/10 bg-black/60 p-5 font-mono text-xs leading-relaxed text-white/70 sm:text-sm">
            <p>
              <span className="text-white/40">x</span>
              <span className="mx-3 text-white/25">→</span>
              <span className="text-white">grid://x.grid/</span>
            </p>
            <p className="mt-2">
              <span className="text-white/40">fire</span>
              <span className="mx-3 text-white/25">→</span>
              <span className="text-white">grid://fire.grid/</span>
            </p>
            <p className="mt-2">
              <span className="text-white/40">grid launch fire</span>
              <span className="mx-3 text-white/25">↔</span>
              <span className="text-white">realm fire in Mesh</span>
            </p>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/45">
            Mesh registers the{" "}
            <span className="font-mono text-white/70">grid://</span> scheme so
            system links open the mesh browser — not a legacy tab.
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
                Nodes. Realms. The fabric.
              </h3>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/45 lg:text-right">
              GRID runs the fabric. Mesh is how you navigate it. Together they
              turn machines into addressable capacity you can open by name.
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

        {/* Resolve pipeline */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="panel p-6 sm:p-8">
            <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-white/40 uppercase">
              Mesh resolve order
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              When you type a bare label, Mesh walks this path until something
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
              Platforms
            </p>
            <ul className="mt-5 space-y-4 text-sm text-white/55">
              <li className="flex justify-between gap-4 border-b border-white/8 pb-3">
                <span>Mac · Intel</span>
                <span className="font-mono text-xs text-white/40">.dmg · .zip</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-white/8 pb-3">
                <span>Mac · M-Series</span>
                <span className="font-mono text-xs text-white/40">.dmg · .zip</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-white/8 pb-3">
                <span>Linux · Browser</span>
                <span className="font-mono text-xs text-white/40">
                  AppImage · .deb
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Windows 11+</span>
                <span className="font-mono text-xs text-white/40">.zip</span>
              </li>
            </ul>
            <a
              href="#mesh-downloads"
              className="mt-8 inline-flex text-[0.7rem] font-semibold tracking-[0.16em] text-white/70 uppercase transition hover:text-white"
            >
              Jump to downloads →
            </a>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-16 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
          {[
            {
              t: "Mesh app",
              d: "Desktop browser for grid:// — Mac, Linux, Windows 11+.",
              href: "#mesh-downloads",
            },
            {
              t: "GRID CLI",
              d: "Node binary — run capacity on your machine.",
              href: "#download",
            },
            {
              t: "Registry",
              d: "Public names + capacity. No IPs stored.",
              href: "/registry",
            },
          ].map((item) => (
            <a key={item.t} href={item.href} className="group block">
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
