import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata(PAGES.admin),
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <main className="min-h-screen bg-black px-5 py-12 text-white sm:px-8 sm:py-16">
        <AdminDashboard />
      </main>
    </>
  );
}
