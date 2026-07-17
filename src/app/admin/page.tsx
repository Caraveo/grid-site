import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin — GRID",
  description: "Operator dashboard",
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
