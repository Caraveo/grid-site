import type { Metadata } from "next";

export const SITE_URL = "https://grid-compute.com";
export const SITE_NAME = "GRID";
/** Marketing / site version (bump with releases). */
export const SITE_VERSION = "0.2.0";

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  /** Short eyebrow on OG art */
  label?: string;
  /** OG image path under /og/ */
  ogImage: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p === "/" ? "" : p}`;
}

/** Full Next.js Metadata with Open Graph + Twitter for a page. */
export function buildMetadata(page: PageSeo): Metadata {
  const url = absoluteUrl(page.path);
  const title = page.title;
  const description = page.description;
  const image = absoluteUrl(page.ogImage);

  return {
    title,
    description,
    keywords: page.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: page.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const PAGES = {
  home: {
    title: "GRID — Useful Mining. Planetary Compute.",
    description:
      "Run a node. Do real work. Earn GRID. The planetary supercomputer built from machines everywhere — Bitcoin is the Transact Security Layer.",
    path: "/",
    label: "GRID",
    ogImage: "/downloads/og/card-00.png",
    keywords: [
      "GRID",
      "useful mining",
      "Proof-of-Resource",
      "distributed compute",
      "DePIN",
      "Mesh browser",
      "Bitcoin TSL",
    ],
  },
  ember: {
    title: "Ember — host + mine + compute + registry | GRID",
    description:
      "An ember is the full stack for one grid:// realm: host useful work, mine security PoR, serve compute, and activate on the public registry.",
    path: "/ember",
    label: "EMBER",
    ogImage: "/downloads/og/card-01.png",
    keywords: [
      "ember",
      "GRID",
      "host",
      "mine",
      "compute",
      "registry",
      "fire.grid",
    ],
  },
  registry: {
    title: "Registry — public names on registry.grid | GRID",
    description:
      "Activate a public GRID name on registry.grid. Cash App $5 → $Caraveo with your note. Prevents abuse and funds human review. Donations accepted.",
    path: "/registry",
    label: "REGISTRY",
    ogImage: "/downloads/og/card-02.png",
    keywords: [
      "registry.grid",
      "GRID",
      "Cash App",
      "node registration",
      "compute name",
    ],
  },
  explain: {
    title: "Explain — GRID & MESH in plain English",
    description:
      "A simple visual overview of GRID (planetary compute network) and Mesh (the grid:// browser). How useful mining works, how names resolve, and how Bitcoin secures value.",
    path: "/explain",
    label: "EXPLAIN",
    ogImage: "/downloads/og/card-03.png",
    keywords: [
      "GRID",
      "MESH",
      "explain",
      "grid://",
      "realms",
      "useful mining",
    ],
  },
  slud: {
    title: "SLUD — Spam. Scam. Slop. | GRID",
    description:
      "Is your web SLUD? Spam, scams, and AI slop buried the legacy web. Protection by default. KillTheWeb. Build the new web — scan, block, verify, protect.",
    path: "/slud",
    label: "SLUD",
    ogImage: "/downloads/og/card-03.png",
    keywords: [
      "SLUD",
      "spam",
      "scam",
      "slop",
      "KillTheWeb",
      "MESH",
      "protection by default",
      "clean web",
    ],
  },
  docs: {
    title: "Docs — Public Registry API | GRID",
    description:
      "Developer documentation for the GRID public registry, mesh globe, computes, name registration, CLI, and earn use cases. Data-only — no private keys or host endpoints.",
    path: "/docs",
    label: "DOCS",
    ogImage: "/downloads/og/card-03.png",
    keywords: [
      "GRID API",
      "registry API",
      "mesh",
      "computes",
      "docs.grid-compute.com",
      "developer docs",
    ],
  },
  shop: {
    title: "Shop — GRID Compute tees | GRID",
    description:
      "Twelve GRID Compute tees — Core Signal, Canvas, Depth, Nodes, Sphere, and more. $100 each via Cash App $Caraveo or equivalent Bitcoin.",
    path: "/shop",
    label: "SHOP",
    ogImage: "/downloads/og/card-00.png",
    keywords: [
      "GRID",
      "shop",
      "tee",
      "t-shirt",
      "merch",
      "GRID Compute",
      "Cash App",
      "Bitcoin",
      "$Caraveo",
    ],
  },
  admin: {
    title: "Admin — GRID registry",
    description: "GRID registry administration.",
    path: "/admin",
    label: "ADMIN",
    ogImage: "/downloads/og/card-04.png",
    noIndex: true,
  },
} as const satisfies Record<string, PageSeo>;
