import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Mission } from "@/components/Mission";
import { Network } from "@/components/Network";
import { Nodes } from "@/components/Nodes";
import { Miners } from "@/components/Miners";
import { Wallets } from "@/components/Wallets";
import { Timeline } from "@/components/Timeline";
import { Download } from "@/components/Download";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <Mission />
        <Network />
        <Nodes />
        <Miners />
        <Wallets />
        <Timeline />
        <Download />
      </main>
      <Footer />
    </>
  );
}
