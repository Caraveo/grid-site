"use client";

import { useState } from "react";
import { ScrambleText } from "./ScrambleText";
import {
  CLI_INSTALL_CURL,
  CLI_INSTALL_FORCE,
  CLI_INSTALL_WINDOWS,
  DOWNLOADS,
} from "@/lib/downloads";

type CliPlatform = {
  id: string;
  name: string;
  arch: string;
  status: "ready" | "soon";
  href: string | null;
  filename: string;
  note: string;
};

const platforms: CliPlatform[] = [
  {
    id: "macos-intel",
    name: "macOS",
    arch: "Intel · x86_64",
    status: "ready",
    href: DOWNLOADS.cli.darwinX64,
    filename: "grid-darwin-x86_64",
    note: "Native Intel binary",
  },
  {
    id: "macos-arm",
    name: "macOS",
    arch: "Apple Silicon · aarch64",
    status: "ready",
    href: DOWNLOADS.cli.darwinArm64,
    filename: "grid-darwin-aarch64",
    note: "Native M-series binary",
  },
  {
    id: "linux-x64",
    name: "Linux",
    arch: "x86_64",
    status: DOWNLOADS.cli.linuxX64 ? "ready" : "soon",
    href: DOWNLOADS.cli.linuxX64,
    filename: "grid-linux-x86_64",
    note: DOWNLOADS.cli.linuxX64
      ? "Static-ish glibc binary"
      : "Cross-build shipping soon",
  },
  {
    id: "windows-x64",
    name: "Windows",
    arch: "x86_64 · CLI",
    status: "ready",
    href: DOWNLOADS.cli.windowsX64,
    filename: "grid-windows-x86_64.exe",
    note: "Native CLI. Run host containers through the WSL2 Linux path.",
  },
];

const QUICK_STARTS = [
  {
    os: "macOS",
    code: "curl -fsSL https://grid-compute.com/downloads/install.sh | bash\nnerdctl info\ngrid init --name my-node --class S",
  },
  {
    os: "Linux",
    code: "curl -fsSL https://grid-compute.com/downloads/install.sh | bash\nnerdctl info\ngrid init --name my-node --class S",
  },
  {
    os: "Windows",
    code: `${CLI_INSTALL_WINDOWS}\ngrid --version\n# For host jobs: wsl --install -d Ubuntu`,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Install the binary",
    body: "The installer detects your OS/CPU, downloads the matching grid binary over HTTPS, verifies it, and places it on your PATH.",
  },
  {
    n: "02",
    title: "Protect keys",
    body: "grid auth binds operator material with a passkey. Your chain and secrets stay local under ~/.grid.",
  },
  {
    n: "03",
    title: "Join the fabric",
    body: "grid init · grid node to host + mine, or grid registry to browse public mesh capacity on grid-compute.com.",
  },
];

function CopyBlock({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/12 bg-black/70">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2">
        <span className="font-mono text-[0.6rem] tracking-[0.18em] text-white/35 uppercase">
          {label}
        </span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              /* ignore */
            }
          }}
          className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[0.6rem] tracking-wider text-white/55 uppercase transition hover:border-white/40 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.78rem] leading-relaxed text-white/80 sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

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
            Get <ScrambleText text="GRID" /> CLI
          </h2>
          <p className="mx-auto mt-6 section-body text-center">
            One official binary, hosted on{" "}
            <span className="font-mono text-white/70">grid-compute.com</span>.
            Installer explains every step — download, verify, install, PATH.
            Looking for the desktop browser?{" "}
            <a
              href="#mesh-downloads"
              className="text-white/70 underline-offset-2 hover:underline"
            >
              Download Mesh
            </a>
            .
          </p>
        </div>

        {/* Hero install card */}
        <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-2xl shadow-black/40">
          <div className="border-b border-white/10 px-6 py-5 sm:px-10 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[0.65rem] tracking-[0.22em] text-emerald-300/80 uppercase">
                  Available · v{DOWNLOADS.cli.version}
                </p>
                <h3 className="mt-1 text-2xl font-thin tracking-wide sm:text-3xl">
                  One-line install
                </h3>
              </div>
              <a
                href={DOWNLOADS.cli.installSh}
                download="install.sh"
                className="rounded-full border border-white/20 px-4 py-2 font-mono text-[0.65rem] tracking-wider text-white/70 uppercase transition hover:border-white/50 hover:text-white"
              >
                View install.sh
              </a>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
              Detects your machine, pulls the matching binary over{" "}
              <span className="text-white/75">HTTPS</span>, checks it is a real
              Phase-1 CLI, installs to{" "}
              <span className="font-mono text-white/75">~/.local/bin</span>, and
              can wire PATH. Does{" "}
              <span className="text-white/75">not</span> start daemons, touch
              Docker, or read your wallet keys.
            </p>
          </div>

          <div className="space-y-4 px-6 py-6 sm:px-10 sm:py-8">
            <CopyBlock label="Install" code={CLI_INSTALL_CURL} />
            <CopyBlock label="Upgrade / reinstall" code={CLI_INSTALL_FORCE} />
            <CopyBlock label="Windows PowerShell" code={CLI_INSTALL_WINDOWS} />
            <CopyBlock
              label="Verify"
              code={`hash -r && which grid && grid -V
grid status
grid auth --help`}
            />
          </div>

          <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="bg-black/50 px-5 py-6 sm:px-6"
              >
                <p className="font-mono text-[0.6rem] tracking-[0.2em] text-white/30">
                  {s.n}
                </p>
                <h4 className="mt-2 text-sm font-medium tracking-wide text-white/90">
                  {s.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-white/45">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform binaries */}
        <div className="mt-10">
          <p className="text-center font-mono text-[0.65rem] tracking-[0.22em] text-white/35 uppercase">
            Direct binaries · same release
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {platforms.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 text-sm text-white/45">{p.arch}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[0.6rem] tracking-[0.12em] uppercase ${
                      p.status === "ready"
                        ? "border-emerald-500/30 text-emerald-200/90"
                        : "border-white/15 text-white/40"
                    }`}
                  >
                    {p.status === "ready" ? "Ready" : "Soon"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-white/35">{p.note}</p>
                {p.href ? (
                  <a
                    href={p.href}
                    download={p.filename}
                    className="mt-6 inline-flex items-center gap-1 text-[0.7rem] font-semibold tracking-[0.16em] text-white/80 uppercase transition hover:text-white"
                  >
                    Download {p.filename} →
                  </a>
                ) : (
                  <p className="mt-6 text-[0.7rem] tracking-[0.16em] text-white/25 uppercase">
                    Coming soon
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <p className="text-center font-mono text-[0.65rem] tracking-[0.22em] text-white/35 uppercase">
            Get started now
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {QUICK_STARTS.map((start) => (
              <CopyBlock key={start.os} label={start.os} code={start.code} />
            ))}
          </div>
        </div>

        {/* What the CLI is */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-white/10 px-6 py-8 sm:px-10">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/35 uppercase">
            What the CLI does
          </p>
          <ul className="mt-4 grid gap-3 text-sm text-white/55 sm:grid-cols-2">
            <li>
              <span className="font-mono text-white/80">grid node</span> — host
              + mine on one box
            </li>
            <li>
              <span className="font-mono text-white/80">grid host / mine</span> —
              useful work vs PoR tracks
            </li>
            <li>
              <span className="font-mono text-white/80">grid registry</span> —
              public mesh from this site
            </li>
            <li>
              <span className="font-mono text-white/80">grid wallet</span> —{" "}
              grid0 addresses · claim · send
            </li>
            <li>
              <span className="font-mono text-white/80">grid status</span> —
              blockchain size + security check
            </li>
            <li>
              <span className="font-mono text-white/80">grid ember</span> — full
              realm stack (e.g. fire.grid)
            </li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-white/35">
            After install, run{" "}
            <span className="font-mono text-white/55">grid status</span> for
            local chain size, supply ledger integrity, and key permission
            checks. Binaries are served only from{" "}
            <span className="font-mono">grid-compute.com/downloads</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
