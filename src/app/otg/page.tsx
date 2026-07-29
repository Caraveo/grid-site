import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Otg27Tickets } from "@/components/Otg27Tickets";
import { buildMetadata, PAGES } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(PAGES.otg27);

const agenda = [
  {
    time: "08:00",
    end: "09:00",
    type: "ARRIVE",
    title: "Check-in + Open Network",
    detail:
      "Coffee, credentials, first connections, and a live view of the GRID network coming online.",
  },
  {
    time: "09:00",
    end: "09:30",
    type: "OPEN",
    title: "Meet Us on the GRID",
    detail:
      "The opening signal: why GRID exists, where the network stands, and what this community can build together.",
  },
  {
    time: "09:30",
    end: "10:15",
    type: "BLOCK 01",
    title: "A Planetary Compute Network",
    detail:
      "GRID in plain language—from useful mining and Proof-of-Resource to a network made from machines everywhere.",
  },
  {
    time: "10:15",
    end: "10:35",
    type: "BREAK",
    title: "Peer Discovery",
    detail: "Find your people: builders, operators, miners, and the GRID-curious.",
  },
  {
    time: "10:35",
    end: "11:20",
    type: "BLOCK 02",
    title: "Inside the Network",
    detail:
      "How nodes, Mesh, identity, compute, and the public registry connect across the protocol.",
  },
  {
    time: "11:20",
    end: "12:00",
    type: "LIVE",
    title: "From Zero to Node",
    detail:
      "A live walkthrough: join the fabric, inspect capacity, and follow useful work across GRID.",
  },
  {
    time: "12:00",
    end: "13:15",
    type: "COMMONS",
    title: "Community Lunch",
    detail:
      "Shared tables organized by interests—not job titles. Lunch is included with every pass.",
  },
  {
    time: "13:15",
    end: "14:00",
    type: "BLOCK 03",
    title: "Useful Mining, Real Work",
    detail:
      "A close look at resource claims, verification, rewards, and the economics of productive compute.",
  },
  {
    time: "14:00",
    end: "14:45",
    type: "VOICES",
    title: "Built at the Edge",
    detail:
      "Fast community stories from people running hardware, shipping tools, and creating new realms.",
  },
  {
    time: "14:45",
    end: "15:05",
    type: "BREAK",
    title: "Re-sync",
    detail: "Coffee, demos, and conversation.",
  },
  {
    time: "15:05",
    end: "16:05",
    type: "DEV LAB",
    title: "Build on GRID",
    detail:
      "Developer-pass lab: APIs, names, workloads, and a guided first build. General attendees join an open community workshop.",
  },
  {
    time: "16:05",
    end: "16:50",
    type: "ROUNDTABLE",
    title: "The Road to 2028",
    detail:
      "An honest conversation about what is ready, what is hard, and what the network needs next.",
  },
  {
    time: "16:50",
    end: "17:15",
    type: "CLOSE",
    title: "The Next Block",
    detail:
      "Commitments, contributor paths, and the closing signal for GRID’s first annual gathering.",
  },
  {
    time: "17:15",
    end: "19:00",
    type: "AFTER",
    title: "OTG After Hours",
    detail: "Music, food, demos, and no panels. Stay on the GRID.",
  },
];

export default function Otg27Page() {
  return (
    <>
      <div className="noise" aria-hidden />
      <Nav />
      <main className="otg-page min-h-screen pt-16 lg:pt-20">
        <section className="otg-hero relative flex min-h-[calc(100svh-4rem)] overflow-hidden border-b border-white/10 px-5 py-10 sm:px-8 lg:px-10">
          <div className="otg-grid pointer-events-none absolute inset-0" />
          <div className="otg-orb pointer-events-none absolute" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-between">
            <div className="flex items-start justify-between border-t border-white/25 pt-4 font-mono text-[0.65rem] tracking-[0.18em] text-white/45 uppercase">
              <span>GRID Community Event / 001</span>
              <span className="hidden sm:block">Signal opens 12.15.27</span>
            </div>

            <div className="py-16 sm:py-20">
              <p className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-[#9cff57] uppercase">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#9cff57]" />
                First transmission
              </p>
              <h1 className="otg-display" aria-label="OTG27">
                <span>OTG</span>
                <span className="otg-27">27</span>
              </h1>
              <div className="mt-8 grid gap-6 md:grid-cols-2 md:items-end">
                <h2 className="max-w-xl text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                  Meet us on the GRID.
                </h2>
                <div className="md:justify-self-end">
                  <p className="max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
                    The first-ever in-person gathering for the GRID blockchain:
                    one day to understand the network, meet the community, and
                    build what comes next.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a href="#tickets" className="otg-btn-signal">
                      Get a ticket
                    </a>
                    <a href="#agenda" className="btn-ghost">
                      View agenda
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-px border border-white/12 bg-white/12 sm:grid-cols-3">
              {[
                ["DATE", "DEC 15, 2027"],
                ["PLACE", "IN PERSON · LOCATION TBA"],
                ["FORMAT", "TALKS · LABS · COMMUNITY"],
              ].map(([label, value]) => (
                <div key={label} className="bg-black/70 p-4 backdrop-blur">
                  <p className="font-mono text-[0.6rem] tracking-[0.2em] text-white/30">
                    {label}
                  </p>
                  <p className="mt-2 text-xs font-semibold tracking-[0.12em]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 px-5 py-24 sm:px-8 lg:px-10 lg:py-36">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <p className="otg-kicker">WHY OTG</p>
            <div>
              <h2 className="max-w-4xl text-[clamp(2.5rem,6vw,6rem)] font-medium leading-[0.95] tracking-[-0.055em]">
                The network becomes real when we&apos;re in the same room.
              </h2>
              <div className="mt-12 grid gap-8 text-base leading-relaxed text-white/50 sm:grid-cols-2">
                <p>
                  OTG27 is the annual point of connection for everyone around
                  GRID—whether you run a node, write code, study distributed
                  systems, or are hearing about the network for the first time.
                </p>
                <p>
                  No endless panels. Expect clear explanations, live systems,
                  honest technical sessions, and enough open space to meet the
                  people who make the network matter.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="agenda" className="scroll-mt-20 px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 border-b border-white/15 pb-10 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="otg-kicker">12.15.27 / PROGRAM</p>
                <h2 className="mt-5 text-5xl font-medium tracking-[-0.05em] sm:text-7xl">
                  One day.
                  <br />
                  Every layer.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-white/45 lg:justify-self-end">
                Times and session details may shift as speakers and the venue
                are confirmed. Ticket holders receive the final field guide.
              </p>
            </div>

            <ol>
              {agenda.map((item, index) => (
                <li
                  key={item.time}
                  className="otg-agenda-row grid gap-5 border-b border-white/10 py-7 sm:grid-cols-[8rem_9rem_1fr] sm:gap-8"
                >
                  <div className="font-mono text-sm">
                    <span className="text-white">{item.time}</span>
                    <span className="text-white/25"> — {item.end}</span>
                  </div>
                  <div>
                    <span className="border border-white/15 px-2 py-1 font-mono text-[0.6rem] tracking-[0.14em] text-[#9cff57]">
                      {item.type}
                    </span>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[0.8fr_1fr]">
                    <h3 className="text-xl font-medium tracking-[-0.02em]">
                      <span className="mr-3 font-mono text-xs text-white/20">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.title}
                    </h3>
                    <p className="max-w-xl text-sm leading-relaxed text-white/45">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="tickets"
          className="scroll-mt-20 border-y border-white/10 bg-white/[0.02] px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="otg-kicker">ACCESS PASSES</p>
                <h2 className="mt-5 text-5xl font-medium tracking-[-0.05em] sm:text-7xl">
                  Pick your layer.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-white/45 lg:justify-self-end">
                Every pass gets you into the room. Choose Developer for the
                deepest technical track or Student to enter the network early.
              </p>
            </div>
            <Otg27Tickets />
          </div>
        </section>

        <section className="px-5 py-24 text-center sm:px-8 lg:py-40">
          <p className="otg-kicker">THE SIGNAL STARTS HERE</p>
          <h2 className="mx-auto mt-6 max-w-5xl text-[clamp(3.5rem,10vw,9rem)] font-semibold leading-[0.86] tracking-[-0.08em]">
            SEE YOU
            <br />
            <span className="text-[#9cff57]">ON THE GRID.</span>
          </h2>
          <a href="#tickets" className="otg-btn-signal mt-12">
            Join OTG27
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
