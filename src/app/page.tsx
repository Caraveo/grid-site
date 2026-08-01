import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { MeshDownloadsRedirect } from "@/components/MeshDownloadsRedirect";
import { Mission } from "@/components/Mission";
import { Network } from "@/components/Network";
import { Nodes } from "@/components/Nodes";
import { Miners } from "@/components/Miners";
import { Wallets } from "@/components/Wallets";
import { Security } from "@/components/Security";
import { Timeline } from "@/components/Timeline";
import { Download } from "@/components/Download";
import { Footer } from "@/components/Footer";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = metadataFor("/");

export default function Home() {
  return (
    <>
      <div className="noise" aria-hidden />
      <MeshDownloadsRedirect />
      <Nav />
      <main>
        <Hero />
        <Mission />
        <Network />
        <Nodes />
        <Miners />
        <Wallets />
        <Security />
        <Timeline />
        <Download />
      </main>
      <Footer />
    </>
  );
}
