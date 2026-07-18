import { ScrambleText } from "./ScrambleText";
import {
  CLI_INSTALL_CURL,
  CLI_INSTALL_FORCE,
  DOWNLOADS,
} from "@/lib/downloads";

const platforms = [
  {
    id: "macos-intel",
    name: "macOS",
    arch: "Intel (x86_64)",
    status: "Binary ready",
    href: DOWNLOADS.cli.darwinX64,
    cta: "Download binary",
  },
  {
    id: "macos-arm",
    name: "macOS",
    arch: "Apple Silicon",
    status: "Coming soon",
    href: null as string | null,
    cta: "Soon",
  },
  {
    id: "linux",
    name: "Linux",
    arch: "x86_64 · aarch64",
    status: "Coming soon",
    href: null as string | null,
    cta: "Soon",
  },
];

export function Download() {
  return (
    <section
      id="download"
      className="relative border-t border-white/10 px-5 py-28 sm:py-36 lg:py-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">
            <ScrambleText text="Phase 1 · Install" />
          </p>
          <h2 className="section-title mt-5">
            Get <ScrambleText text="GRID" />
          </h2>
          <p className="mx-auto mt-6 section-body text-center">
            The node CLI is a single binary for the fabric. Hosted here on
            grid-compute.com. Looking for the desktop browser?{" "}
            <a
              href="#mesh"
              className="text-white/70 underline-offset-2 hover:underline"
            >
              Download Mesh
            </a>
            .
          </p>
        </div>

        {/* Primary CTA — binary + install script */}
        <div className="mx-auto mt-14 max-w-3xl border border-white/15 bg-white/[0.03] p-8 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-white/45 uppercase">
                Available now · v{DOWNLOADS.cli.version}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                GRID CLI <span className="text-white/40">binary</span>
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/50">
                Phase&nbsp;1 node:{" "}
                <span className="font-mono text-white/70">grid host</span>,{" "}
                <span className="font-mono text-white/70">node</span>,{" "}
                <span className="font-mono text-white/70">coord</span>,{" "}
                <span className="font-mono text-white/70">ember</span>. Installer
                drops the binary into{" "}
                <span className="font-mono text-white/70">~/.local/bin</span>.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              <a
                href={DOWNLOADS.cli.darwinX64}
                download="grid"
                className="btn-primary"
              >
                Download binary
              </a>
              <a
                href={DOWNLOADS.cli.installSh}
                download="install.sh"
                className="btn-ghost text-center"
              >
                install.sh
              </a>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto border border-white/10 bg-black/60 p-5 font-mono text-xs leading-relaxed text-white/70 sm:text-sm">
            <p className="text-white/35"># install CLI from this site</p>
            <p className="break-all">
              <span className="text-white/40">$</span> {CLI_INSTALL_CURL}
            </p>
            <p className="mt-4 text-white/35"># or download the binary directly</p>
            <p className="break-all">
              <span className="text-white/40">$</span> curl -fsSL
              https://grid-compute.com{DOWNLOADS.cli.darwinX64} -o ~/.local/bin/grid
              && chmod +x ~/.local/bin/grid
            </p>
            <p className="mt-4 text-white/35"># verify (must show auth / master)</p>
            <p>
              <span className="text-white/40">$</span> hash -r && which grid &&
              grid -V
            </p>
            <p>
              <span className="text-white/40">$</span> grid auth --help
            </p>
            <p className="mt-4 text-white/35"># upgrade / replace</p>
            <p className="break-all">
              <span className="text-white/40">$</span> {CLI_INSTALL_FORCE}
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
              {p.href ? (
                <a
                  href={p.href}
                  download
                  className="mt-6 inline-flex text-[0.7rem] font-semibold tracking-[0.16em] text-white/70 uppercase transition hover:text-white"
                >
                  {p.cta} →
                </a>
              ) : (
                <p className="mt-6 text-[0.7rem] tracking-[0.16em] text-white/25 uppercase">
                  {p.cta}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-lg text-center text-xs leading-relaxed text-white/35">
          Binaries are served from{" "}
          <span className="font-mono">grid-compute.com/downloads</span>. Need
          the Mesh browser for Mac, Linux, or Windows?{" "}
          <a
            href="#mesh-downloads"
            className="text-white/55 underline-offset-2 hover:underline"
          >
            Download Mesh
          </a>
          .
        </p>
      </div>
    </section>
  );
}
