/** Public developer docs navigation — never link internal ops surfaces. */

export const DOCS_SITE_URL = "https://docs.grid-compute.com";
export const API_BASE = "https://grid-compute.com";

export type DocsNavItem = {
  href: string;
  label: string;
  hint?: string;
};

export type DocsNavSection = {
  title: string;
  items: DocsNavItem[];
};

export const DOCS_NAV: DocsNavSection[] = [
  {
    title: "Start",
    items: [
      { href: "/docs", label: "Introduction", hint: "What GRID exposes" },
      {
        href: "/docs/concepts",
        label: "Concepts",
        hint: "Nodes · computes · names",
      },
      {
        href: "/docs/getting-started",
        label: "Getting started",
        hint: "Join the pilot network",
      },
    ],
  },
  {
    title: "Network",
    items: [
      {
        href: "/docs/network",
        label: "Architecture & status",
        hint: "Genesis · coordinator · P2P",
      },
      {
        href: "/docs/por",
        label: "Proof of Resource",
        hint: "Verify · score · settle",
      },
      {
        href: "/docs/explorer",
        label: "Explorer API",
        hint: "Blocks · settlements · health",
      },
      {
        href: "/docs/wallets",
        label: "ARK + Phoenix wallets",
        hint: "Custody · pairing · signing",
      },
    ],
  },
  {
    title: "Public API",
    items: [
      {
        href: "/docs/registry",
        label: "Registry",
        hint: "GET /api/registry",
      },
      {
        href: "/docs/nodes",
        label: "Nodes & mesh",
        hint: "Globe · peers · pings",
      },
      {
        href: "/docs/computes",
        label: "Computes",
        hint: "Capacity directory",
      },
      {
        href: "/docs/register",
        label: "Name registration",
        hint: "Activate a public name",
      },
      {
        href: "/docs/identity",
        label: "Identity badges",
        hint: "Key · Verified",
      },
      {
        href: "/docs/auth",
        label: "Auth for writes",
        hint: "Node signatures · operator auth",
      },
    ],
  },
  {
    title: "Build",
    items: [
      { href: "/docs/cli", label: "GRID CLI", hint: "Peer · mine · wallet" },
      {
        href: "/docs/examples",
        label: "Code examples",
        hint: "curl · JS · Python",
      },
      {
        href: "/docs/earn",
        label: "Earn & use cases",
        hint: "What you can build",
      },
      {
        href: "/docs/security",
        label: "Data & safety",
        hint: "What is never public",
      },
      {
        href: "https://grid-compute.com/white-paper",
        label: "White paper",
        hint: "Architecture · vision · PDF ↗",
      },
    ],
  },
];

export function docsPathOnHost(pathname: string, host?: string | null): string {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (host?.startsWith("docs.")) {
    if (p === "/docs") return "/";
    if (p.startsWith("/docs/")) return p.slice("/docs".length);
  }
  return p;
}
