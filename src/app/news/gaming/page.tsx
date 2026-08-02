import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = metadataFor("/news/gaming");

const published = "August 2, 2026";

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 border-l-2 border-orange-300 pl-6 text-2xl leading-snug font-medium tracking-tight text-white sm:text-3xl">
      {children}
    </blockquote>
  );
}

export default function GamingNewsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="relative isolate min-h-[46rem] overflow-hidden px-5 pb-20 pt-36 sm:min-h-[52rem] sm:pb-28 sm:pt-44">
        <Image
          src="/images/void-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,.96)_0%,rgba(0,0,0,.76)_42%,rgba(0,0,0,.22)_76%,rgba(0,0,0,.48)_100%),linear-gradient(0deg,#000_0%,transparent_38%,rgba(0,0,0,.35)_100%)]" />
        <div className="relative mx-auto flex min-h-[32rem] max-w-4xl flex-col justify-end sm:min-h-[37rem]">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.65rem] tracking-[0.16em] uppercase">
            <Link href="/news" className="border border-orange-300/35 bg-black/35 px-3 py-1.5 text-orange-200 backdrop-blur-sm transition hover:bg-orange-300/10">
              GRID News
            </Link>
            <span className="border border-white/20 bg-black/25 px-3 py-1.5 text-white/60 backdrop-blur-sm">Field note</span>
            <time className="text-white/50" dateTime="2026-08-02">{published}</time>
          </div>
          <p className="mt-10 font-mono text-xs tracking-[0.2em] text-orange-300/80 uppercase">VOID × GRID</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(4rem,10vw,8rem)] font-semibold leading-[0.84] tracking-[-0.07em] text-white">
            Gaming is <span className="text-orange-300">useful compute.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl">
            Persistent worlds make infrastructure answer to the hardest critic it can have: a human being waiting for the world to respond.
          </p>
        </div>
      </header>

      <article className="px-5 pb-24 pt-12 sm:pb-32">
        <div className="mx-auto max-w-3xl">
          <div className="border-y border-white/10 py-5 font-mono text-[0.65rem] tracking-[0.14em] text-white/35 uppercase">
            Persistent worlds · Real-time systems · Planetary compute
          </div>

          <div className="mt-12 space-y-7 text-[1.05rem] leading-8 text-white/62 sm:text-lg sm:leading-9">
            <p className="text-xl leading-9 text-white/82 sm:text-2xl sm:leading-10">
              A game server is a computer trying to keep a promise.
            </p>
            <p>
              The promise is that every player occupies the same understandable reality. Ships remain where they were left. Projectiles follow consistent rules. Cargo does not disappear. Movement feels immediate. When another pilot enters a system, the world changes for everyone already there. Maintaining that promise is useful computational work.
            </p>
            <p>
              AI inference, rendering, scientific simulation, and batch processing all belong on GRID. Games add another category: computation that must stay interactive, persistent, synchronized, geographically aware, and responsive to human decisions in real time. The result is not hidden in a report delivered tomorrow. It is a place people are inhabiting now.
            </p>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Games are infrastructure</h2>
            <p>
              A persistent multiplayer game combines infrastructure problems that are often considered separately. It needs authoritative world simulation, physics and movement, state synchronization, regional placement, persistent storage, entity ownership, combat validation, matchmaking and discovery, proximity communication, anti-cheat systems, replays, asset delivery, dynamic generation, failure recovery, and relentless latency management.
            </p>
            <p>
              Those systems have to agree under pressure. A combat event may begin as an input from a player, become movement validated by an authoritative simulation, affect several nearby entities, produce an event record, update persistent state, and propagate to players across different network conditions. If one layer is late or wrong, the abstraction breaks.
            </p>
            <p>
              Gaming exposes infrastructure quality immediately. A delayed AI result may be inconvenient. A delayed movement update can make a world feel physically broken. Players notice jitter, rollback, impossible hits, missing inventory, and regional imbalance without needing an observability dashboard. Their experience is the dashboard.
            </p>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Why VOID belongs beside GRID</h2>
            <p>
              VOID is a Space MMO—a persistent wireframe universe built around high-speed movement, exploration, survival, mining, transformation, live combat, unknown star systems, asteroid fields, caves, gateways, cargo, and proximity-based encounters. The player controls CHIP, a machine built to fly, fight, mine, survive, and transform. The galaxy is uncovered by traveling through it, not by reading an exposition screen.
            </p>
            <p>
              Its principles are simple: efficiency over graphics, systems over spectacle, and discovery over exposition. The wireframe style began partly as a response to limited resources. Rather than imitate a studio with thousands of expensive assets, VOID concentrates effort on movement, combat, simulation, networking, persistence, exploration, and the gameplay loop. A constraint became the identity.
            </p>
            <p>
              That makes VOID more than a game carrying GRID branding. It is a systems-first laboratory that can reveal what the network must eventually become. Can computation be placed close enough to players? Can different regions of a universe run on different machines? Can state move safely through a gateway? Can a workload recover when a node disappears? Can results be verified without putting every action on a blockchain? Can operators contribute resources without surrendering control of their hardware?
            </p>
            <p>
              Most importantly: can the system remain enjoyable instead of exposing its architecture to the player? These are research and engineering questions, not completed claims.
            </p>

            <a
              href="https://void.grid-compute.com/why"
              className="my-12 flex items-center justify-between gap-5 border border-orange-300/25 bg-orange-300/[0.045] p-6 text-lg font-semibold text-white transition hover:border-orange-300/55 hover:bg-orange-300/[0.075] sm:p-8 sm:text-xl"
            >
              <span>Read why I decided to make VOID</span>
              <span className="text-orange-300" aria-hidden="true">→</span>
            </a>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">A planetary game server</h2>
            <p>
              A future GRID-hosted universe would not ask every machine to do everything. Low-latency nodes could operate active simulation. GPU-capable machines could take generation or rendering workloads. Storage nodes could preserve world data. Regional nodes could handle proximity-sensitive communication. Larger operators could serve dense systems while smaller machines perform background simulation, generation, indexing, testing, or less time-sensitive work.
            </p>
            <p>
              Work would be routed by capability, availability, proximity, power limits, thermal limits, reliability, and the requirements of the workload. Operators would retain control of their machines and schedules. Proof of Resource would need to measure real contribution. GRID would meter the useful compute, while Bitcoin serves as the Transact Security Layer for hard settlement.
            </p>
            <PullQuote>Distribution is not the absence of architecture. It demands better architecture.</PullQuote>
            <p>
              The point is not maximal fragmentation. It is to match each task to machines capable of completing it within the task’s latency, reliability, power, and verification boundaries. A planetary computer becomes useful when it knows the difference between a combat tick that cannot wait and a background generation job that can.
            </p>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">What should not be decentralized</h2>
            <p>
              Decentralization is not automatically appropriate for every operation. Every movement input should not be written to a blockchain. Every laser shot should not become an on-chain transaction. Players should not mine tokens merely by leaving a client open, and VOID does not require NFTs to justify its existence. Random consumer nodes cannot be trusted with authoritative state without verification. Latency does not stop mattering because a network is distributed.
            </p>
            <p>
              Some systems may need authoritative coordination, trusted execution boundaries, redundancy, deterministic replay, operator reputation, or specialized hardware. Security boundaries must be designed around adversarial behavior, not optimism. A node disappearing during a quiet indexing job is different from a node disappearing while it owns an active combat region.
            </p>
            <p>
              GRID should distribute work where distribution improves resilience, reach, ownership, utilization, or economics—not as an ideological requirement. The network should remain open, inspectable, geographically distributed, and difficult for one company to capture. It should also be honest about where coordination is necessary.
            </p>

            <h2 className="pt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Build the workload and the network together</h2>
            <p>
              A compute network designed only around synthetic benchmarks may become excellent at passing benchmarks. A network tested by a living world has to respond to actual movement, failure, congestion, geography, persistence, adversarial behavior, and human expectations. It has to operate under load that is meaningful precisely because someone cares about the outcome.
            </p>
            <PullQuote>VOID gives GRID something more valuable than a demonstration. It gives the network a reason to become better.</PullQuote>
            <p>
              VOID can make vague architecture decisions concrete. Where does state live? Who may advance it? How quickly can ownership move? What evidence proves that useful simulation occurred? Which work can be repeated, and which work must never diverge? Those questions help turn “distributed compute” from a category into an engineering discipline.
            </p>
            <p>
              Today, VOID is an independently developed Space MMO in alpha. GRID is an early open compute network. The complete distributed gaming architecture is a direction being explored, not a finished production claim. Building both projects in public lets each challenge the assumptions of the other.
            </p>
            <p>
              The planetary computer should not exist only to complete jobs hidden inside datacenters. It should be capable of sustaining places people can enter, explore, fight over, remember, and return to.
            </p>
            <p className="text-xl font-semibold text-white sm:text-2xl">
              Gaming is useful compute. VOID is where we begin proving what that means.
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
