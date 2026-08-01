import { Footer } from "@/components/Footer";
import { Mesh } from "@/components/Mesh";
import { Nav } from "@/components/Nav";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("/mesh");

export default function MeshPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main>
        <Mesh />
      </main>
      <Footer />
    </>
  );
}
