import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Mesh } from "@/components/Mesh";
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

export const metadata: Metadata = buildMetadata(PAGES.home);

export default function Home() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <Mesh />
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
