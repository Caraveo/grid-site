import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SchoolDashboard } from "@/components/school/SchoolDashboard";

export const metadata: Metadata = {
  title: "GRID School — Learn the entire network",
  description:
    "A lesson-based course covering GRID, MESH, mining, hosting, P2P networking, APIs, contributors, community operations, security, economics, and the roadmap.",
  alternates: { canonical: "https://grid-compute.com/school" },
  openGraph: {
    title: "GRID School — Learn the entire network",
    description: "Eight lessons, graded quizzes, and one complete path through GRID.",
    url: "https://grid-compute.com/school",
    siteName: "GRID",
    type: "website",
  },
};

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
