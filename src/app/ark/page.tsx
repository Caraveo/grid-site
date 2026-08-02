import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = metadataFor("/ark");

export default function ARKPage() {
  const release =
    "https://github.com/Caraveo/grid-wallets/releases/download/v0.2.26";
  const desktop = [
    ["Mac", "Universal native SwiftUI", `${release}/ARK-macOS-universal.zip`],
    ["Windows", "Native desktop installer", `${release}/ARK-Windows-x86_64-setup.exe`],
    ["Linux", "Portable AppImage", `${release}/ARK-Linux-x86_64.AppImage`],
  ];
  return (
    <main className="min-h-screen bg-[#050706] text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24">
        <p className="mb-5 text-xs font-semibold tracking-[0.28em] text-[#50F01C]">
          ARK — GRID WALLET
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] sm:text-7xl">
          Native by design.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">
          ARK is not a web wallet. Signing keys stay in the platform security
          hardware and Keychain-backed storage; transactions are signed locally
          before submission to GRID.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
          {desktop.map(([platform, technology, href]) => (
            <div key={platform} className="bg-[#0a0d0b] p-6">
              <h2 className="text-xl font-medium">{platform}</h2>
              <p className="mt-2 text-sm text-[#50F01C]">{technology}</p>
              <a
                href={href}
                className="mt-8 inline-flex border border-white/20 px-4 py-2 text-sm transition hover:border-[#50F01C] hover:text-[#50F01C]"
              >
                Download v0.2.26
              </a>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm text-white/45">
          iPhone and Android builds are not released yet. Desktop previews are
          ad-hoc or unsigned until platform signing and notarization are complete.
        </p>

        <div className="mt-10">
          <Link
            href="/docs/wallets"
            className="inline-flex border border-white/20 px-5 py-3 text-sm font-medium transition hover:border-[#50F01C] hover:text-[#50F01C]"
          >
            Read the wallet security model
          </Link>
        </div>
      </section>
    </main>
  );
}
