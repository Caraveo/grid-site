import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ScrambleText } from "@/components/ScrambleText";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGES.wallet);

const releaseBase =
  "https://github.com/Caraveo/grid/releases/download/wallet-v0.1.0";

const downloads = [
  {
    platform: "macOS",
    format: "Apple silicon",
    detail: "Native SwiftUI · macOS 13+ · light + dark",
    href: `${releaseBase}/GRID-Wallet-macOS-aarch64.zip`,
    primary: true,
  },
  {
    platform: "macOS",
    format: "Intel",
    detail: "Native SwiftUI · macOS 13+ · light + dark",
    href: `${releaseBase}/GRID-Wallet-macOS-x86_64.zip`,
  },
  {
    platform: "Windows",
    format: "Installer",
    detail: "Windows 10/11 · x86_64 · desktop app",
    href: `${releaseBase}/GRID-Wallet-Windows-x86_64-setup.exe`,
    primary: true,
  },
  {
    platform: "Windows",
    format: "MSI",
    detail: "Windows 10/11 · x86_64 · managed install",
    href: `${releaseBase}/GRID-Wallet-Windows-x86_64.msi`,
  },
  {
    platform: "Linux",
    format: "AppImage",
    detail: "Portable · x86_64",
    href: `${releaseBase}/GRID-Wallet-Linux-x86_64.AppImage`,
    primary: true,
  },
  {
    platform: "Linux",
    format: "Debian",
    detail: "Debian / Ubuntu · x86_64",
    href: `${releaseBase}/GRID-Wallet-Linux-x86_64.deb`,
  },
];

const features = [
  ["Encrypted vault", "Protect the operator key with a 24-word recovery phrase, password, platform passkey, or combined mode."],
  ["GRID management", "Create a grid0 address, inspect balances and activity, claim verified mining rewards, and send GRID."],
  ["Solana rewards", "Create or import the public Solana reward address used by the devnet mining settlement flow."],
  ["Local custody", "Recovery secrets stay on the device and are never sent to grid-compute.com."],
];

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`border-t border-white/10 px-5 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export default function WalletPage() {
  return (
    <main className="min-h-screen">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pt-36 pb-20 sm:pt-44 sm:pb-28">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="section-label">Native GRID custody</p>
          <h1 className="mt-6 max-w-6xl text-[clamp(3.7rem,10vw,8.5rem)] leading-[0.86] font-semibold tracking-[-0.06em] text-white">
            Your GRID.
            <br />
            Your keys.
          </h1>
          <ScrambleText
            text="MACOS · WINDOWS · LINUX"
            className="mt-8 block font-mono text-xs tracking-[0.22em] text-cyan-200/70 sm:text-sm"
          />
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/50 sm:text-xl">
            The real GRID wallet workflow in a desktop interface: encrypted
            recovery, balances, mining claims, transfers, and Solana reward routing.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#downloads" className="btn-primary">Choose your platform</a>
            <Link href="/token?view=1" className="btn-ghost">Understand the layers</Link>
          </div>
        </div>
      </header>

      <Section id="downloads">
        <div className="mb-12 max-w-2xl">
          <p className="section-label">Desktop release · v0.1.0 preview</p>
          <h2 className="section-title mt-5">Pick your platform.</h2>
          <p className="section-body mt-6">
            These preview builds use local custody. Back up the recovery phrase
            before moving GRID, and use test balances while the release is audited.
          </p>
        </div>
        <div className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
          {downloads.map((download) => (
            <article key={`${download.platform}-${download.format}`} className="bg-black p-7 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight text-white">{download.platform}</h3>
                <span className="font-mono text-[0.62rem] tracking-[0.16em] text-cyan-200/55 uppercase">
                  {download.format}
                </span>
              </div>
              <p className="mt-4 min-h-10 text-sm leading-relaxed text-white/45">{download.detail}</p>
              <a
                href={download.href}
                className={download.primary ? "btn-primary mt-7 w-full" : "btn-ghost mt-7 w-full"}
              >
                Download
              </a>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-white/35">
          Preview builds are unsigned/ad-hoc while platform signing and independent
          security review are completed. Your operating system may show an
          unrecognized-developer warning.{" "}
          <a
            href={`${releaseBase}/SHA256SUMS`}
            className="text-white/55 underline underline-offset-4 hover:text-white"
          >
            Verify checksums
          </a>
          .
        </p>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="section-label">One wallet · three layers</p>
            <h2 className="section-title mt-5">Utility to settlement.</h2>
            <p className="section-body mt-6">
              The app keeps the roles separate so the status is never ambiguous.
              GRID management is local. Solana rewards are on devnet. The Bitcoin
              consolidation route remains a release gate—not a pretend button.
            </p>
          </div>
          <div className="panel grid items-center gap-4 rounded-sm p-7 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:p-10">
            {[
              ["GRID", "LIVE", "Compute utility · wallet · mining claims"],
              ["SOL", "DEVNET", "Public reward rail · test assets"],
              ["BTC", "ROADMAP", "Audited consolidation · final settlement"],
            ].map(([asset, status, detail], index) => (
              <div key={asset} className="contents">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${status === "LIVE" ? "bg-emerald-400" : status === "DEVNET" ? "bg-cyan-300" : "bg-amber-300"}`} />
                    <strong className="text-2xl text-white">{asset}</strong>
                  </div>
                  <p className="mt-2 font-mono text-[0.6rem] tracking-[0.16em] text-white/35">{status}</p>
                  <p className="mt-3 text-xs leading-relaxed text-white/45">{detail}</p>
                </div>
                {index < 2 && <span className="hidden text-2xl text-white/20 sm:block">→</span>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <p className="section-label">What is inside</p>
        <h2 className="section-title mt-5 max-w-4xl">The CLI workflow, without the terminal.</h2>
        <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2">
          {features.map(([title, detail], index) => (
            <article key={title} className="bg-black p-7 sm:p-9">
              <span className="font-mono text-xs text-cyan-200/40">0{index + 1}</span>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/45">{detail}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="text-center">
        <p className="section-label">Safety first</p>
        <h2 className="section-title mx-auto mt-5 max-w-4xl">Write down the phrase.</h2>
        <p className="section-body mx-auto mt-6">
          GRID cannot recover a lost recovery phrase. Never paste it into a website,
          chat, support ticket, or mining coordinator.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href="#downloads" className="btn-primary">Download wallet</a>
          <Link href="/docs/security" className="btn-ghost">Security docs</Link>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
