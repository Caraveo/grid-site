import { Logo } from "./Logo";
import { DOWNLOADS } from "@/lib/downloads";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-white">
              <Logo className="h-6 w-6" />
              <span className="text-sm font-semibold tracking-[0.35em]">
                GRID
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/40">
              Useful mining for a planetary compute network.
              <br />
              GRID meters compute. Bitcoin secures value.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
            <div>
              <h4 className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/35 uppercase">
                Product
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>
                  <a href="/explain" className="transition hover:text-white">
                    Explain
                  </a>
                </li>
                <li>
                  <a href="/ember" className="transition hover:text-white">
                    Ember
                  </a>
                </li>
                <li>
                  <a href="/registry" className="transition hover:text-white">
                    Registry
                  </a>
                </li>
                <li>
                  <a href="/#mesh" className="transition hover:text-white">
                    MESH
                  </a>
                </li>
                <li>
                  <a href="/#mission" className="transition hover:text-white">
                    Mission
                  </a>
                </li>
                <li>
                  <a href="/#network" className="transition hover:text-white">
                    Network
                  </a>
                </li>
                <li>
                  <a href="/#nodes" className="transition hover:text-white">
                    Nodes
                  </a>
                </li>
                <li>
                  <a href="/#wallets" className="transition hover:text-white">
                    Wallets
                  </a>
                </li>
                <li>
                  <a href="/#security" className="transition hover:text-white">
                    Security
                  </a>
                </li>
                <li>
                  <a href="/#timeline" className="transition hover:text-white">
                    Phases
                  </a>
                </li>
                <li>
                  <a href="/#download" className="transition hover:text-white">
                    Download
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/35 uppercase">
                Mesh downloads
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>
                  <a
                    href="/downloads/mesh/mac-intel/MESH.dmg"
                    download="MESH-mac-intel.dmg"
                    className="transition hover:text-white"
                  >
                    Mac · Intel
                  </a>
                </li>
                <li>
                  <a
                    href="/downloads/mesh/mac-arm/MESH.dmg"
                    download="MESH-mac-arm.dmg"
                    className="transition hover:text-white"
                  >
                    Mac · M-Series
                  </a>
                </li>
                <li>
                  <a
                    href="/downloads/mesh/linux/MESH.AppImage"
                    download="MESH-linux.AppImage"
                    className="transition hover:text-white"
                  >
                    Linux · Browser
                  </a>
                </li>
                <li>
                  <a
                    href="/downloads/mesh/windows/MESH-Setup.zip"
                    download="MESH-Setup.zip"
                    className="transition hover:text-white"
                  >
                    Windows 11+
                  </a>
                </li>
                <li>
                  <a
                    href={DOWNLOADS.cli.darwinX64}
                    download="grid"
                    className="transition hover:text-white"
                  >
                    GRID CLI binary
                  </a>
                </li>
                <li>
                  <a href="/#mesh-downloads" className="transition hover:text-white">
                    All Mesh platforms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/35 uppercase">
                Protocol
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>
                  <span className="text-white/40">Proof-of-Resource</span>
                </li>
                <li>
                  <span className="text-white/40">Bitcoin TSL</span>
                </li>
                <li>
                  <span className="text-white/40">MIT License</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} GRID. Software MIT. Vision docs CC-BY-4.0.
          </p>
          <p className="font-mono text-[0.65rem] tracking-[0.15em] text-white/25 uppercase">
            Hosted downloads · Phase 1 · No testnet economy
          </p>
        </div>
      </div>
    </footer>
  );
}
