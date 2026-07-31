import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SchoolDashboard } from "@/components/school/SchoolDashboard";

export const metadata: Metadata = metadataFor("/school");

export default function SchoolPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <SchoolDashboard />
      <Footer />
    </>
  );
}
