import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { metadataFor } from "@/lib/seo";
import { SeekSearch } from "@/components/SeekSearch";

export const metadata = metadataFor("/seek");

export default function SeekPage() {
  return (
    <>
      <Nav />
      <main>
        <SeekSearch />
      </main>
      <Footer />
    </>
  );
}
