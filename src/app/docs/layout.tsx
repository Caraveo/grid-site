import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";
import { DOCS_SITE_URL } from "@/lib/docs-nav";

export const metadata: Metadata = {
  title: {
    default: "GRID Docs — Network & Public API",
    template: "%s · GRID Docs",
  },
  description:
    "Documentation for the GRID pilot network: Genesis, P2P peers, Proof of Resource, mining, wallets, Explorer, registry, and public APIs.",
  metadataBase: new URL(DOCS_SITE_URL),
  openGraph: {
    title: "GRID Docs — Network & Public API",
    description:
      "Operator and developer docs for the GRID useful-compute pilot network.",
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
