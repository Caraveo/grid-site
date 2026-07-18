import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";
import { DOCS_SITE_URL } from "@/lib/docs-nav";

export const metadata: Metadata = {
  title: {
    default: "GRID Docs — Public Registry API",
    template: "%s · GRID Docs",
  },
  description:
    "Public API documentation for GRID: registry, nodes, computes, mesh globe, name registration, and CLI. Data-only — no private keys, no host endpoints.",
  metadataBase: new URL(DOCS_SITE_URL),
  openGraph: {
    title: "GRID Docs — Public Registry API",
    description:
      "Developer docs for the GRID public registry and mesh data plane.",
    url: DOCS_SITE_URL,
    siteName: "GRID Docs",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsShell>{children}</DocsShell>;
}
