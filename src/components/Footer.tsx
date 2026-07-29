import { Logo } from "./Logo";
import { DOWNLOADS } from "@/lib/downloads";

function siteHref(href: string, siteOrigin?: string) {
  return siteOrigin && href.startsWith("/") ? `${siteOrigin}${href}` : href;
}

export function Footer({ siteOrigin }: { siteOrigin?: string } = {}) {
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

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-12">
            <div>
              <h4 className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/35 uppercase">
                Product
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>
                  <a
                    href={siteHref("/otg", siteOrigin)}
                    className="transition hover:text-white"
                  >
                    OTG27
                  </a>
                </li>
                <li>
                  <a href={siteHref("/explain", siteOrigin)} className="transition hover:text-white">
                    Explain
                  </a>
                </li>
                <li>
                  <a href={siteHref("/news", siteOrigin)} className="transition hover:text-white">
                    News
                  </a>
                </li>
                <li>
                  <a href={siteHref("/token?view=1", siteOrigin)} className="transition hover:text-white">
                    Token
                  </a>
                </li>
                <li>
                  <a href={siteHref("/alloc?view=1", siteOrigin)} className="transition hover:text-white">
                    Allocation
                  </a>
                </li>
                <li>
                  <a href={siteHref("/slud", siteOrigin)} className="transition hover:text-white">
                    SLUD
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.grid-compute.com"
                    className="transition hover:text-white"
                  >
                    Docs
                  </a>
                </li>
                <li>
                  <a href={siteHref("/ember", siteOrigin)} className="transition hover:text-white">
                    Ember
                  </a>
                </li>
                <li>
                  <a href={siteHref("/registry", siteOrigin)} className="transition hover:text-white">
                    Registry
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#mesh", siteOrigin)} className="transition hover:text-white">
                    MESH
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#mission", siteOrigin)} className="transition hover:text-white">
                    Mission
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#network", siteOrigin)} className="transition hover:text-white">
                    Network
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#nodes", siteOrigin)} className="transition hover:text-white">
                    Nodes
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#wallets", siteOrigin)} className="transition hover:text-white">
                    Wallets
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#security", siteOrigin)} className="transition hover:text-white">
                    Security
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#timeline", siteOrigin)} className="transition hover:text-white">
                    Phases
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#download", siteOrigin)} className="transition hover:text-white">
                    Download
                  </a>
                </li>
                <li>
                  <a href={siteHref("/shop", siteOrigin)} className="transition hover:text-white">
                    Shop
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
                    href={siteHref("/downloads/mesh/mac-intel/MESH.dmg", siteOrigin)}
                    download="MESH-mac-intel.dmg"
                    className="transition hover:text-white"
                  >
                    Mac · Intel
                  </a>
                </li>
                <li>
                  <a
                    href={siteHref("/downloads/mesh/mac-arm/MESH.dmg", siteOrigin)}
                    download="MESH-mac-arm.dmg"
                    className="transition hover:text-white"
                  >
                    Mac · M-Series
                  </a>
                </li>
                <li>
                  <a
                    href={siteHref("/downloads/mesh/linux/MESH.AppImage", siteOrigin)}
                    download="MESH-linux.AppImage"
                    className="transition hover:text-white"
                  >
                    Linux · Browser
                  </a>
                </li>
                <li>
                  <a
                    href={siteHref("/downloads/mesh/windows/MESH-Setup.zip", siteOrigin)}
                    download="MESH-Setup.zip"
                    className="transition hover:text-white"
                  >
                    Windows 11+
                  </a>
                </li>
                <li>
                  <a
                    href={siteHref(DOWNLOADS.cli.darwinX64, siteOrigin)}
                    download="grid"
                    className="transition hover:text-white"
                  >
                    GRID CLI binary
                  </a>
                </li>
                <li>
                  <a href={siteHref("/#mesh-downloads", siteOrigin)} className="transition hover:text-white">
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
                  <a href={siteHref("/por", siteOrigin)} className="transition hover:text-white">
                    Proof-of-Resource
                  </a>
                </li>
                <li>
                  <a href={siteHref("/white-paper", siteOrigin)} className="transition hover:text-white">
                    White paper
                  </a>
                </li>
                <li>
                  <span className="text-white/40">Bitcoin TSL</span>
                </li>
                <li>
                  <span className="text-white/40">MIT License</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/35 uppercase">
                Community
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>
                  <a
                    href="https://discord.gg/nVs7NBCuqZ"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-white"
                  >
                    Join Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} GRID. Software MIT. Vision docs CC-BY-4.0.
          </p>

          <span
            className="group relative inline-flex items-center justify-center opacity-55 transition hover:opacity-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zia-glasses.png"
              alt=""
              width={88}
              height={28}
              className="h-7 w-auto select-none"
            />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[16rem] -translate-x-1/2 border border-white/15 bg-black/95 px-3 py-2 text-center text-[0.7rem] leading-snug tracking-wide text-white/80 opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              From the team that brought you Zia Vision
            </span>
          </span>

          <p className="font-mono text-[0.65rem] tracking-[0.15em] text-white/25 uppercase">
            Hosted downloads · Phase 1 · No testnet economy
          </p>
        </div>
      </div>
    </footer>
  );
}
