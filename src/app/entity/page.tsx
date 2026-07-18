import type { Metadata } from "next";
import { EntityApply } from "@/components/EntityApply";

/**
 * Unlisted page — do NOT add to main Nav.
 * Key ($300) and Verified Entity ($10k) via Cash App $Caraveo.
 * No public protocol marketing.
 */
export const metadata: Metadata = {
  title: "Entity · GRID",
  description: "Realm security and organization verification.",
  robots: { index: false, follow: false },
};

export default function EntityPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/35 uppercase">
          Unlisted · not in main navigation
        </p>
        <h1 className="mt-3 text-3xl font-thin tracking-wide sm:text-4xl">
          Realm security &amp; verification
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/55">
          Optional upgrades for an already registered realm. Pay via Cash App{" "}
          <span className="font-mono text-white/80">$Caraveo</span> with the
          note we give you — same flow as name activation. Admin reviews before
          activation.
        </p>
        <EntityApply />
      </div>
    </main>
  );
}
