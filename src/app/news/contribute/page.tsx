import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Welcome to the GRID — A Call for Contributors",
  description:
    "GRID is calling developers, open-source maintainers, community leaders, researchers, writers, designers, moderators, and OTG organizers to help build the project.",
  alternates: { canonical: "https://grid-compute.com/news/contribute" },
  openGraph: {
    title: "Welcome to the GRID — A Call for Contributors",
    description:
      "56,712 lines. Five connected codebases. One approved contributor. It is time to widen the circle.",
    url: "https://grid-compute.com/news/contribute",
    siteName: "GRID",
    type: "article",
    publishedTime: "2026-07-30T00:00:00-06:00",
    images: [{ url: "/downloads/og/card-03.png", width: 1200, height: 630, alt: "Welcome to the GRID" }],
  },
};

const stats = [
  ["56,712", "lines of source", "Measured across Rust, TypeScript, TSX, CSS, Python, SQL, and shell code."],
  ["305", "source files", "Excluding dependencies, generated builds, distribution folders, and caches."],
  ["5", "connected codebases", "Core GRID, the website and portal, networking, coordination, and Solana integration."],
  ["68", "web + API routes", "Public pages, documentation, registry, explorer, contributor, mail, task, and admin surfaces."],
  ["6", "contributor paths", "Engineering, education, community, OTG, creative communications, and coordination."],
  ["1", "approved contributor", "The contributor system is new. The project is not waiting for a crowd to pretend it already exists."],
];

const calls = [
  {
    title: "Open-source developers + maintainers",
    copy:
      "Rust, TypeScript, React, Cloudflare Workers, distributed systems, APIs, networking, cryptography, Solana, testing, release automation, and the unglamorous maintenance that keeps public software alive.",
    ask:
      "Review code. Open issues. Improve tests. Fix rough edges. Design APIs. Build examples. Make releases repeatable. Help turn a founder-led codebase into a contributor-owned practice.",
  },
  {
    title: "Security reviewers + adversarial thinkers",
    copy:
      "People who notice trust boundaries, unsafe defaults, authentication mistakes, economic exploits, privacy leaks, dependency risks, and claims that outrun evidence.",
    ask:
      "Threat-model the system. Review passkeys, sessions, messaging, registry flows, resource verification, and operational boundaries. Teach us where the design is fragile.",
  },
  {
    title: "Community managers + moderators",
    copy:
      "Not engagement farmers—stewards. People who can welcome newcomers, maintain standards, connect questions to answers, de-escalate conflict, and make participation legible.",
    ask:
      "Shape Discord channels, contributor onboarding, office hours, working groups, community safety, support practices, and a culture where serious people can do serious work.",
  },
  {
    title: "OTG organizers + local conveners",
    copy:
      "Programmers of gatherings: speaker curators, workshop leads, venue operators, volunteer coordinators, local chapter starters, partnership builders, and production people.",
    ask:
      "Help make OTG more than a conference page. Produce build nights, technical workshops, local meetups, demos, contributor sessions, and the annual gathering itself.",
  },
  {
    title: "Writers, educators + translators",
    copy:
      "Technical writers, documentation engineers, educators, DevRel practitioners, translators, diagram makers, and people who can explain difficult systems without making false promises.",
    ask:
      "Improve API docs, tutorials, architecture maps, examples, onboarding, release notes, accessibility, localization, and the plain-language bridge into GRID.",
  },
  {
    title: "Designers, storytellers + communicators",
    copy:
      "Product designers, UX researchers, brand designers, motion artists, editors, video producers, social leads, press thinkers, and community storytellers.",
    ask:
      "Give GRID a coherent public language. Make tools usable. Document real people doing real work. Help communication remain accurate, memorable, and unmistakably ours.",
  },
  {
    title: "Researchers + crypto-native operators",
    copy:
      "Distributed-systems researchers, mechanism designers, governance experimenters, DAO operators, grants people, legal and policy thinkers, and protocol historians.",
    ask:
      "Interrogate Proof of Resource, incentives, identity, reputation, coordination, public goods, contributor governance, and the boundary between a working pilot and a decentralized destination.",
  },
  {
    title: "Project managers + quality operators",
    copy:
      "Issue triagers, release coordinators, QA leads, product managers, accessibility testers, program operators, and people who are unusually good at closing loops.",
    ask:
      "Turn ideas into scoped tasks. Keep decisions visible. Track dependencies. Reproduce bugs. Define done. Help contributors know what matters and where their work fits.",
  },
];

function Rule() {
  return <div className="my-14 h-px bg-white/10" aria-hidden />;
}

export default function ContributorCallArticle() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="contributor-article min-h-screen bg-background pt-16 lg:pt-20">
        <article>
          <header className="hero-glow relative overflow-hidden border-b border-white/10 px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-40">
            <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative mx-auto max-w-7xl">
              <p className="section-label">OPEN CALL / JULY 30, 2026</p>
              <h1 className="mt-7 max-w-6xl text-[clamp(3.8rem,9vw,8.5rem)] font-semibold leading-[0.84] tracking-[-0.07em] text-white">
                Welcome
                <br />
                <span className="text-emerald-300">to the GRID.</span>
              </h1>
              <div className="mt-12 grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
                <p className="max-w-4xl text-xl leading-relaxed text-white/62 sm:text-2xl">
                  A call to the crypto community: developers, maintainers, organizers,
                  moderators, writers, designers, researchers, educators, and operators.
                  The machine layer is taking shape. Now we need the human network.
                </p>
                <div className="lg:justify-self-end">
                  <p className="font-mono text-xs leading-relaxed tracking-[0.1em] text-white/36 uppercase">
                    This is not a call to mine, host a node, or rent compute. This is a
                    call to help build and steward the project itself.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a href="https://discord.gg/nVs7NBCuqZ" target="_blank" rel="noreferrer" className="btn-primary">
                      Join the public Discord
                    </a>
                    <a href="https://mail.grid-compute.com/login?mode=register" className="btn-ghost">
                      Request contributor access
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="mx-auto max-w-4xl">
              <p className="text-2xl font-medium leading-relaxed tracking-[-0.025em] text-white sm:text-4xl">
                Crypto talks endlessly about decentralization. But software does not
                become decentralized because a repository is visible, and a community
                does not become real because a Discord server exists.
              </p>
              <div className="mt-12 columns-1 gap-12 text-base leading-[1.85] text-white/52 md:columns-2">
                <p className="mb-6">
                  Decentralization requires people who can understand the work, disagree
                  in public, maintain what they did not invent, explain what they did not
                  market, and carry responsibility without waiting for permission.
                </p>
                <p className="mb-6">
                  GRID began with a technical proposition: machines everywhere can
                  become a useful compute fabric when resources, work, verification,
                  identity, and settlement are coordinated. That proposition spans more
                  than a protocol. It requires software, interfaces, documentation,
                  events, support, governance experiments, security review, and durable
                  contributor operations.
                </p>
                <p className="mb-6">
                  The project already has enough surface area that one person cannot
                  responsibly remain the only center of context. That is not a weakness
                  to hide. It is the exact moment when open source has to become a
                  practice instead of a label.
                </p>
                <p>
                  We are not recruiting spectators around a token story. We are inviting
                  people into unfinished work: code that needs review, tests that need
                  depth, language that needs precision, communities that need care, and
                  institutions that have not yet been designed.
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
                <div><p className="section-label">PROJECT SNAPSHOT</p><h2 className="section-title mt-5">The work is real. The contributor base is early.</h2></div>
                <p className="max-w-lg text-sm leading-relaxed text-white/40 lg:justify-self-end">
                  Snapshot measured directly from the GRID workspace and production
                  contributor database on July 30, 2026. Generated dependencies and
                  build artifacts are excluded.
                </p>
              </div>
              <div className="mt-14 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map(([value, label, detail]) => (
                  <div key={label} className="bg-background p-7 sm:p-9">
                    <p className="font-mono text-5xl font-semibold tracking-[-0.06em] text-emerald-300">{value}</p>
                    <h3 className="mt-3 text-sm font-semibold tracking-[0.12em] text-white uppercase">{label}</h3>
                    <p className="mt-4 text-xs leading-relaxed text-white/35">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-4 text-xs leading-relaxed text-white/38 sm:grid-cols-2 lg:grid-cols-4">
                <p><strong className="text-white/70">Rust:</strong> 18,297 lines across 63 files.</p>
                <p><strong className="text-white/70">TypeScript + TSX:</strong> 35,592 lines across 224 files.</p>
                <p><strong className="text-white/70">Infrastructure:</strong> AWS SES/Lambda/DynamoDB and Cloudflare Workers/D1.</p>
                <p><strong className="text-white/70">Quality gap:</strong> seven detected test files—an explicit invitation to QA contributors.</p>
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <p className="section-label">WHO WE ARE LOOKING FOR</p>
              <h2 className="section-title mt-5 max-w-5xl">Contributors of every kind—provided the contribution is real.</h2>
              <div className="mt-14 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-2">
                {calls.map((call, index) => (
                  <section key={call.title} className="bg-background p-7 sm:p-10">
                    <div className="flex items-start gap-5">
                      <span className="font-mono text-xs text-emerald-300/45">0{index + 1}</span>
                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{call.title}</h3>
                        <p className="mt-4 text-sm leading-relaxed text-white/45">{call.copy}</p>
                        <p className="mt-6 border-l border-emerald-300/40 pl-4 text-sm leading-relaxed text-white/65">{call.ask}</p>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="mx-auto max-w-4xl">
              <p className="section-label">DISCORD + SLACK</p>
              <h2 className="section-title mt-5">Two rooms. Two different jobs.</h2>
              <Rule />
              <div className="grid gap-12 md:grid-cols-2">
                <div>
                  <p className="font-mono text-xs tracking-[0.16em] text-[#9da5ff] uppercase">Public Discord / the commons</p>
                  <h3 className="mt-5 text-2xl font-semibold text-white">Start in the open.</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/48">
                    Discord is the public front door: meet the community, ask questions,
                    share relevant work, find a working group, discuss events, propose an
                    idea, or understand the project before requesting contributor access.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/48">
                    It should remain welcoming to curious people and useful to serious
                    builders. No credential is required to begin participating.
                  </p>
                  <a href="https://discord.gg/nVs7NBCuqZ" target="_blank" rel="noreferrer" className="mt-7 inline-flex text-sm font-semibold text-[#aeb4ff]">
                    Enter GRID Discord ↗
                  </a>
                </div>
                <div>
                  <p className="font-mono text-xs tracking-[0.16em] text-emerald-300 uppercase">Contributor Slack / operations</p>
                  <h3 className="mt-5 text-2xl font-semibold text-white">Coordinate trusted work.</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/48">
                    Slack is for approved contributors doing active work: issue triage,
                    release coordination, project channels, task assignment, working
                    sessions, moderation operations, OTG production, and decisions that
                    need accountable owners.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/48">
                    Access follows contributor approval. Every approved contributor also
                    receives a <span className="text-white/75">@gridmail.dev</span> identity,
                    secure dashboard, task board, passkeys, and authenticator-based 2FA.
                  </p>
                  <a href="https://mail.grid-compute.com/login?mode=register" className="mt-7 inline-flex text-sm font-semibold text-emerald-300">
                    Request contributor access →
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
            <div className="mx-auto max-w-7xl border border-emerald-300/20 bg-emerald-300/[0.05] p-8 sm:p-12 lg:p-16">
              <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
                <div>
                  <p className="section-label">THE ASK</p>
                  <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[.98] tracking-[-0.055em] text-white sm:text-7xl">
                    Bring a skill.
                    <br />
                    Find unfinished work.
                    <br />
                    Leave it more open.
                  </h2>
                </div>
                <div>
                  <p className="text-base leading-relaxed text-white/52">
                    You do not need to be a protocol engineer. You do need to care about
                    evidence, follow-through, public work, and the people beside you.
                    Show us what you know, what you want to learn, and what you are ready
                    to own.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a href="https://mail.grid-compute.com/login?mode=register" className="btn-primary">Join the contributor group</a>
                    <a href="/contribute" className="btn-ghost">Explore contributor paths</a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
