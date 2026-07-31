import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contribute — Build GRID with us",
  description:
    "Join the GRID contributor group: open-source engineering, documentation, community stewardship, OTG organizing, research, design, and project coordination.",
  alternates: { canonical: "https://grid-compute.com/contribute" },
  openGraph: {
    title: "Contribute — Build GRID with us",
    description: "Code, organize, document, design, research, and grow the GRID community.",
    url: "https://grid-compute.com/contribute",
    siteName: "GRID",
    type: "website",
    images: [{ url: "/downloads/og/card-03.png", width: 1200, height: 630, alt: "Contribute to GRID" }],
  },
};

const paths = [
  {
    number: "01",
    title: "Open-source engineering",
    signal: "SHIP THE COMMONS",
    description:
      "Build the protocol, Mesh browser, CLI, SDKs, wallet, coordinator, explorer, web surfaces, developer tooling, and the systems that connect them.",
    roles: ["Core + protocol engineering", "Frontend + product engineering", "SDKs + integrations", "Testing + quality engineering", "Security review", "Release engineering"],
  },
  {
    number: "02",
    title: "Documentation + education",
    signal: "MAKE IT LEGIBLE",
    description:
      "Turn a complex network into something people can understand, inspect, use, and build upon without needing an interpreter.",
    roles: ["Technical writing", "Tutorials + examples", "API references", "Developer education", "Diagrams + explainers", "Localization + accessibility"],
  },
  {
    number: "03",
    title: "Community stewardship",
    signal: "KEEP THE SIGNAL HUMAN",
    description:
      "Welcome contributors, support healthy conversation, connect people to useful work, and help establish a culture worth joining.",
    roles: ["Community management", "Contributor onboarding", "Moderation + safety", "Support operations", "Ambassador programs", "Working-group facilitation"],
  },
  {
    number: "04",
    title: "OTG organizers",
    signal: "BRING THE NETWORK TOGETHER",
    description:
      "Help produce OTG gatherings, workshops, build nights, talks, demos, and local community moments where collaboration becomes real.",
    roles: ["Program + speaker curation", "Venue + production", "Volunteer coordination", "Workshops + hack sessions", "Local chapters", "Partnerships + sponsorships"],
  },
  {
    number: "05",
    title: "Creative + communications",
    signal: "TELL THE TRUE STORY",
    description:
      "Give GRID a clear voice and visual language without sanding away the difficult, technical, open-source character of the project.",
    roles: ["Brand + visual design", "Product design", "Video + motion", "Editorial + newsletters", "Social + press", "Community storytelling"],
  },
  {
    number: "06",
    title: "Research + coordination",
    signal: "MAKE THE WORK COHERE",
    description:
      "Investigate hard questions, keep priorities visible, triage issues, and help independent contributors move in the same direction.",
    roles: ["Distributed-systems research", "Economics + incentives", "Project management", "Issue triage", "Governance experiments", "Policy + open-source operations"],
  },
];

const principles = [
  ["Build in public", "Work should be inspectable, discussable, and useful beyond a private roadmap."],
  ["Earn trust through work", "Titles matter less than follow-through, judgment, documentation, and care for other contributors."],
  ["Protect the community", "Technical ambition does not excuse hostility, manipulation, harassment, or extractive behavior."],
  ["Tell the truth", "Represent what exists, what is experimental, and what remains difficult without manufacturing certainty."],
];

export default function ContributePage() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="contribute-page min-h-screen bg-background pt-16 lg:pt-20">
        <header className="hero-glow relative overflow-hidden border-b border-foreground/10 px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-40">
          <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
              <div>
                <p className="section-label">CONTRIBUTOR GROUP / OPEN CALL</p>
                <h1 className="mt-7 max-w-5xl text-[clamp(4rem,10vw,9rem)] font-semibold leading-[0.82] tracking-[-0.07em] text-foreground">
                  Help build
                  <br />
                  <span className="text-[var(--contribute-accent)]">the GRID.</span>
                </h1>
              </div>
              <div className="lg:pb-2">
                <p className="text-lg leading-relaxed text-muted">
                  GRID needs people who write code, shape projects, document systems,
                  welcome communities, organize gatherings, test assumptions, and make
                  open-source work sustainable.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="https://mail.grid-compute.com/login?mode=register" className="btn-primary">
                    Request contributor access
                  </a>
                  <a href="#paths" className="btn-ghost">Find your path</a>
                </div>
              </div>
            </div>
            <div className="mt-16 border-l-2 border-[var(--contribute-accent)]/60 pl-6 sm:max-w-3xl">
              <p className="font-mono text-xs tracking-[0.16em] text-[var(--contribute-accent)] uppercase">A different kind of contribution</p>
              <p className="mt-3 text-base leading-relaxed text-muted">
                This group is not for hosting machines, mining rewards, or selling
                compute. It is for the people who build, maintain, explain, coordinate,
                and grow the project itself.
              </p>
            </div>
          </div>
        </header>

        <section id="paths" className="scroll-mt-20 border-b border-foreground/10 px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 border-b border-foreground/12 pb-12 lg:grid-cols-2 lg:items-end">
              <div><p className="section-label">WAYS TO CONTRIBUTE</p><h2 className="section-title mt-5">There is more than one way to build infrastructure.</h2></div>
              <p className="max-w-lg text-base leading-relaxed text-muted lg:justify-self-end">
                Join an existing stream, propose a focused project, or help turn an
                unfinished idea into maintained public work.
              </p>
            </div>
            <div className="mt-12 grid gap-px border border-foreground/10 bg-foreground/10 md:grid-cols-2 xl:grid-cols-3">
              {paths.map((path) => (
                <article key={path.number} className="group bg-background p-7 transition hover:bg-foreground/[0.035] sm:p-9">
                  <div className="flex items-center justify-between font-mono text-[0.65rem] tracking-[0.16em] uppercase">
                    <span className="text-[var(--contribute-accent)]">{path.number}</span><span className="text-muted">{path.signal}</span>
                  </div>
                  <h3 className="mt-12 text-2xl font-semibold tracking-[-0.03em] text-foreground">{path.title}</h3>
                  <p className="mt-4 min-h-24 text-sm leading-relaxed text-muted">{path.description}</p>
                  <ul className="mt-7 space-y-2 border-t border-foreground/10 pt-5">
                    {path.roles.map((role) => <li key={role} className="flex gap-3 text-xs text-muted"><span className="text-[var(--contribute-accent)]">+</span>{role}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-foreground/10 px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="section-label">HOW WE WORK</p><h2 className="section-title mt-5">Participation with responsibility.</h2></div>
            <div className="grid gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2">
              {principles.map(([title, copy], index) => (
                <article key={title} className="bg-background p-7 sm:p-9">
                  <span className="font-mono text-xs text-[var(--contribute-accent)]">0{index + 1}</span>
                  <h3 className="mt-8 text-xl font-semibold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-7xl border border-[var(--contribute-accent)]/20 bg-[var(--contribute-accent)]/[0.045] p-7 sm:p-12 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-end">
              <div><p className="section-label">THE CONTRIBUTOR PATH</p><h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-6xl">Request access. Meet the work. Become part of the group.</h2></div>
              <div>
                <ol className="space-y-4 font-mono text-xs tracking-[0.08em] text-muted">
                  <li><span className="mr-3 text-[var(--contribute-accent)]">01</span>Create and verify your contributor account</li>
                  <li><span className="mr-3 text-[var(--contribute-accent)]">02</span>An administrator reviews the request</li>
                  <li><span className="mr-3 text-[var(--contribute-accent)]">03</span>Receive your @gridmail.dev identity</li>
                  <li><span className="mr-3 text-[var(--contribute-accent)]">04</span>Join tasks, discussions, and working groups</li>
                </ol>
                <a href="https://mail.grid-compute.com/login?mode=register" className="btn-primary mt-8">Join the contributor group</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
