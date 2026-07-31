import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "GRID News | Dispatches from the open compute network",
  description:
    "Announcements, field notes, and essays from GRID on open infrastructure, useful compute, and community-verifiable systems.",
};

const stories = [
  {
    href: "/news/contribute",
    date: "July 30, 2026",
    tag: "Open call",
    number: "03",
    title: "Welcome to the GRID",
    summary:
      "A data-rich call to developers, maintainers, security reviewers, community leaders, writers, designers, researchers, and OTG organizers to help turn GRID into a contributor-owned practice.",
    featured: true,
  },
  {
    href: "/news/open",
    date: "July 29, 2026",
    tag: "Announcement",
    number: "02",
    title: "We’re going open.",
    summary:
      "GRID is committing its infrastructure, protocols, and core code to the open—because systems that coordinate compute and value should be inspectable by the people who rely on them.",
    featured: false,
  },
  {
    href: "/news/letter",
    date: "July 28, 2026",
    tag: "Founder letter",
    number: "01",
    title: "Crypto should secure more than a ledger.",
    summary:
      "Why GRID is being built, how Proof of Resource connects useful work to evidence, and what the Phase 1 network honestly is today.",
    featured: false,
  },
];

export default function NewsPage() {
  return (
    <main className="news-page min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pb-16 pt-36 sm:pb-24 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.18em] text-[var(--news-blue)] uppercase">
            <span className="h-px w-10 bg-[var(--news-blue)]/60" />
            Dispatches from the network
          </div>
          <h1 className="mt-7 text-[clamp(4.5rem,12vw,9.5rem)] font-semibold leading-[0.8] tracking-[-0.075em] text-white">
            News<span className="text-[var(--news-blue)]">.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-white/55 sm:text-xl">
            Announcements, field notes, and arguments for infrastructure that can
            be inspected, challenged, and improved in public.
          </p>
        </div>
      </header>

      <section className="px-5 pb-28 sm:pb-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[0.65rem] tracking-[0.16em] text-white/35 uppercase">
            <span>Latest releases</span>
            <span>{stories.length.toString().padStart(2, "0")} stories</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {stories.map((story) => (
              <article
                key={story.href}
                className={`group relative flex min-h-[28rem] flex-col overflow-hidden border p-7 transition duration-300 sm:p-9 ${
                  story.featured
                    ? "border-[var(--news-blue)]/25 bg-[var(--news-blue)]/[0.045] hover:border-[var(--news-blue)]/50"
                    : "border-white/10 bg-white/[0.018] hover:border-white/25"
                }`}
              >
                <div className="absolute right-5 top-2 font-mono text-[7rem] leading-none tracking-[-0.08em] text-white/[0.025] sm:text-[9rem]">
                  {story.number}
                </div>
                <div className="relative flex items-center gap-3 font-mono text-[0.63rem] tracking-[0.14em] uppercase">
                  <span className={story.featured ? "text-[var(--news-blue)]" : "text-white/45"}>{story.tag}</span>
                  <span className="text-white/20">/</span>
                  <time className="text-white/35">{story.date}</time>
                </div>
                <div className="relative mt-auto pt-24">
                  {story.featured && (
                    <span className="mb-5 inline-flex border border-[var(--news-blue)]/25 bg-[var(--news-blue)]/[0.08] px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.15em] text-[var(--news-blue)] uppercase">
                      New
                    </span>
                  )}
                  <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl">
                    {story.title}
                  </h2>
                  <p className="mt-6 max-w-xl text-base leading-7 text-white/50">
                    {story.summary}
                  </p>
                  <Link
                    href={story.href}
                    className="mt-8 inline-flex items-center gap-3 font-mono text-xs tracking-[0.13em] text-white uppercase transition group-hover:text-[var(--news-blue)]"
                  >
                    Read story
                    <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
