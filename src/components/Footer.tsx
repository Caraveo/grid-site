import { Logo } from "./Logo";
import { DOWNLOADS, MESH_DOWNLOADS } from "@/lib/downloads";

type FooterLink = {
  label: string;
  href: string;
  download?: string;
  external?: boolean;
};

function siteHref(href: string, siteOrigin?: string) {
  return siteOrigin && href.startsWith("/") ? `${siteOrigin}${href}` : href;
}

function LinkGroup({
  title,
  links,
  siteOrigin,
}: {
  title: string;
  links: FooterLink[];
  siteOrigin?: string;
}) {
  return (
    <div>
      <h2 className="font-mono text-[0.65rem] font-semibold tracking-[0.2em] text-white/35 uppercase">
        {title}
      </h2>
      <ul className="mt-5 space-y-3 text-sm text-white/60">
        {links.map(({ label, href, download, external }) => (
          <li key={label}>
            <a
              href={siteHref(href, siteOrigin)}
              download={download}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="inline-flex items-center gap-1.5 transition hover:text-white"
            >
              {label}
              {external && (
                <span aria-hidden="true" className="text-[0.65rem] text-white/25">
                  ↗
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EXPLORE_LINKS: FooterLink[] = [
  { label: "What is GRID?", href: "/explain" },
  { label: "Network", href: "/#network" },
  { label: "Nodes", href: "/#nodes" },
  { label: "Registry", href: "/registry" },
  { label: "Build status", href: "/status" },
  { label: "News", href: "/news" },
  { label: "Roadmap", href: "/#timeline" },
];

const BUILD_LINKS: FooterLink[] = [
  { label: "Documentation", href: "https://docs.grid-compute.com", external: true },
  { label: "Proof of Resource", href: "/por" },
  { label: "White paper", href: "/white-paper" },
  { label: "Token", href: "/token?view=1" },
  { label: "Allocation", href: "/alloc?view=1" },
  { label: "GitHub", href: "https://github.com/Caraveo/grid", external: true },
];

const meshArm = MESH_DOWNLOADS.find(({ id }) => id === "mac-arm")?.primary;
const meshIntel = MESH_DOWNLOADS.find(({ id }) => id === "mac-intel")?.primary;
const meshWindows = MESH_DOWNLOADS.find(({ id }) => id === "windows")?.primary;
const meshLinux = MESH_DOWNLOADS.find(({ id }) => id === "linux")?.primary;

const GET_GRID_LINKS: FooterLink[] = [
  {
    label: "MESH for Mac · Apple silicon",
    href: meshArm?.href ?? "/mesh",
    download: meshArm?.filename,
  },
  {
    label: "MESH for Mac · Intel",
    href: meshIntel?.href ?? "/mesh",
    download: meshIntel?.filename,
  },
  {
    label: "MESH for Windows",
    href: meshWindows?.href ?? "/mesh",
    download: meshWindows?.filename,
  },
  {
    label: "MESH for Linux",
    href: meshLinux?.href ?? "/mesh",
    download: meshLinux?.filename,
  },
  {
    label: "GRID CLI",
    href: DOWNLOADS.cli.darwinX64,
    download: "grid",
  },
  { label: "All downloads", href: "/mesh" },
];

const CONNECT_LINKS: FooterLink[] = [
  { label: "Discord", href: "https://discord.gg/nVs7NBCuqZ", external: true },
  { label: "YouTube", href: "https://www.youtube.com/@GRID-COMPUTE", external: true },
  { label: "OTG27", href: "/otg" },
  { label: "Phoenix Wallet", href: "/phoenix" },
  { label: "SLUD", href: "/slud" },
  { label: "Shop", href: "/shop" },
  { label: "Security", href: "/#security" },
];

export function Footer({ siteOrigin }: { siteOrigin?: string } = {}) {
  return (
    <footer className="border-t border-white/10 px-5 py-14 sm:py-18">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.15fr_2fr] lg:gap-20 lg:pb-18">
          <div className="max-w-sm">
            <a
              href={siteHref("/", siteOrigin)}
              aria-label="GRID home"
              className="group inline-flex items-center gap-3 text-white"
            >
              <Logo className="h-7 w-7" />
              <span className="text-sm font-semibold tracking-[0.35em]">GRID</span>
            </a>
            <p className="mt-6 text-lg leading-relaxed text-white/65">
              Useful compute, coordinated across a planetary network.
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/35">
              GRID meters compute. Bitcoin secures value.
            </p>
            <a
              href={siteHref("/mesh", siteOrigin)}
              className="mt-7 inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.16em] text-white/70 uppercase transition hover:text-white"
            >
              Download MESH
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 sm:gap-x-10"
          >
            <LinkGroup title="Explore" links={EXPLORE_LINKS} siteOrigin={siteOrigin} />
            <LinkGroup title="Build" links={BUILD_LINKS} siteOrigin={siteOrigin} />
            <LinkGroup title="Get GRID" links={GET_GRID_LINKS} siteOrigin={siteOrigin} />
            <LinkGroup title="Connect" links={CONNECT_LINKS} siteOrigin={siteOrigin} />
          </nav>
        </div>

        <div className="flex flex-col gap-7 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs text-white/35">
              © {new Date().getFullYear()} GRID
            </p>
            <p className="text-[0.7rem] text-white/25">
              Software MIT · Vision documents CC BY 4.0
            </p>
          </div>

          <span className="group relative inline-flex w-fit items-center justify-center opacity-55 transition hover:opacity-100">
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

          <p className="font-mono text-[0.62rem] leading-relaxed tracking-[0.14em] text-white/25 uppercase sm:text-right">
            Genesis pilot
            <br />
            No testnet economy
          </p>
        </div>
      </div>
    </footer>
  );
}
