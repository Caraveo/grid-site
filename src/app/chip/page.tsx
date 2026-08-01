import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ScrambleText } from "@/components/ScrambleText";
import styles from "./chip.module.css";

export const metadata: Metadata = metadataFor("/chip");

function Section({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-foreground/10 px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

const distinctions = [
  {
    label: "Token",
    title: "Utility on another ledger",
    copy: "A token is issued and transferred through an existing blockchain. It inherits that chain’s transaction rail.",
  },
  {
    label: "CHIP",
    title: "Utility with its own computational truth",
    copy: "A CHIP represents useful work inside its own signed network history while remaining portable through an external public rail.",
  },
  {
    label: "Coin",
    title: "Native to its blockchain",
    copy: "A coin is the native asset of a blockchain and participates directly in that chain’s security and settlement model.",
  },
];

const dictionary = [
  {
    term: "CHIP",
    pronunciation: "/tʃɪp/",
    kind: "noun · GRID cryptography",
    definition:
      "A computational hybrid instrument: an asset whose utility is created and evidenced by a compute network, while ownership can travel through an external token rail toward coin settlement.",
  },
  {
    term: "token",
    pronunciation: "/ˈtoʊkən/",
    kind: "noun · hosted digital asset",
    definition:
      "An asset issued and accounted for on an existing blockchain. In the CHIP model, a token can provide a portable ownership and transaction rail, but it does not create GRID’s underlying record of computational utility.",
  },
  {
    term: "coin",
    pronunciation: "/kɔɪn/",
    kind: "noun · blockchain-native asset",
    definition:
      "The native asset of its own blockchain, used within that chain’s security and settlement system. In the CHIP model, Bitcoin is an independent coin settlement boundary—not the GRID CHIP itself.",
  },
];

export default function ChipPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="noise" aria-hidden="true" />
      <Nav />

      <header className="hero-glow relative overflow-hidden px-5 pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-0">
          <div className="relative z-10">
            <p className="section-label">CHIP · Computational Hybrid Instrument Protocol</p>
            <h1 className="relative z-20 mt-6 font-semibold leading-[0.82] tracking-[-0.065em] text-foreground lg:w-[min(78vw,1100px)] lg:text-[clamp(7rem,11vw,10rem)]">
              <span className="block text-[clamp(4rem,12vw,10rem)] lg:whitespace-nowrap lg:text-inherit">
                <span className="text-cyan-300">CHIP</span> the
              </span>
              <span className="block text-[clamp(4rem,12vw,10rem)] lg:whitespace-nowrap lg:text-inherit">
                old BLOCK.
              </span>
            </h1>
            <ScrambleText
              text="TOKEN UTILITY. BLOCKCHAIN TRUTH. COMPUTE FIRST."
              className="mt-9 block font-mono text-xs tracking-[0.22em] text-cyan-200/70 sm:text-sm"
            />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
              GRID is not described by “token” or “coin” alone. A CHIP combines the
              portable utility of a token with a blockchain-native record of useful
              computation.
            </p>
            <a href="#model" className="btn-primary mt-10">
              See the model
            </a>
          </div>

          <figure className="relative -mb-8 min-h-[280px] sm:min-h-[390px] lg:-mb-16 lg:min-h-[570px]">
            <div
              className="pointer-events-none absolute inset-x-[12%] bottom-[8%] h-12 bg-cyan-300/10 blur-3xl"
              aria-hidden="true"
            />
            <Image
              src="/images/grid-chip-light.png"
              alt="A grounded stack of white GRID cryptographic chips with one chip standing upright"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className={`${styles.lightArt} object-contain object-bottom`}
            />
            <Image
              src="/images/grid-chip-dark.png"
              alt="A grounded stack of black GRID cryptographic chips with one chip standing upright"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className={`${styles.darkArt} object-contain object-bottom`}
            />
          </figure>
        </div>
      </header>

      <Section id="model">
        <div className="grid gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
          <div>
            <p className="section-label">The new category</p>
            <h2 className="section-title mt-5">Between a token and a coin.</h2>
            <p className="section-body mt-6">
              CHIP is GRID’s architectural term for an asset whose utility originates
              in a computational network, whose work history is recorded by that
              network, and whose ownership can move across established settlement rails.
            </p>
          </div>

          <div
            className="border border-foreground/15 bg-foreground/[0.025] p-5 sm:p-8"
            aria-label="Token and coin converge into CHIP-GRID, which connects through SOL to BTC"
          >
            <div className="grid gap-px bg-foreground/10 sm:grid-cols-[1fr_auto_1fr]">
              <div className="bg-background p-6 text-center">
                <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
                  Token
                </p>
                <p className="mt-3 text-2xl font-semibold text-foreground">Portable utility</p>
              </div>
              <div className="grid min-h-20 place-items-center bg-background px-5 font-mono text-2xl text-cyan-300">
                →
              </div>
              <div className="bg-cyan-300/[0.08] p-6 text-center">
                <p className="font-mono text-xs tracking-[0.18em] text-cyan-300 uppercase">
                  CHIP
                </p>
                <p className="mt-3 text-2xl font-semibold text-foreground">Hybrid truth</p>
              </div>
            </div>

            <div className="grid place-items-center py-4 font-mono text-2xl text-cyan-300">
              ↑
            </div>

            <div className="mx-auto max-w-sm border border-foreground/12 bg-background p-6 text-center">
              <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Coin</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">Native settlement</p>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

            <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-sm tracking-[0.08em] sm:text-base">
              <strong className="border border-cyan-300/45 bg-cyan-300/[0.1] px-5 py-4 text-cyan-200">
                CHIP-GRID
              </strong>
              <span className="text-muted">→</span>
              <span className="border border-foreground/15 px-5 py-4 text-foreground">
                SOL <span className="text-muted">(Token)</span>
              </span>
              <span className="text-muted">→</span>
              <span className="border border-amber-300/35 px-5 py-4 text-amber-200">
                BTC <span className="text-muted">(Coin)</span>
              </span>
            </div>
          </div>
        </div>
      </Section>

      <Section id="both-and-neither">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <div>
            <p className="section-label">The category question</p>
            <h2 className="max-w-5xl text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-foreground">
              Is a CHIP a Token or a Coin?
            </h2>
          </div>
          <div className="border-l-2 border-cyan-300/55 pl-6 sm:pl-8">
            <p className="text-3xl font-semibold tracking-tight text-cyan-300 sm:text-5xl">
              Well… both and neither.
            </p>
            <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
              A CHIP behaves like a token when it moves through a public ledger. It
              behaves like a coin when its meaning comes from its own network history.
              But it is not merely either one: its utility originates in verified
              computation, then travels through separate transaction and settlement
              layers. That hybrid is the point. It is a CHIP.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-px bg-foreground/10 md:grid-cols-3">
          {[
            ["Token-like", "Portable ownership and fast transfer through the Solana rail."],
            ["Coin-like", "Meaning anchored in GRID’s own signed computational history."],
            ["Distinctly CHIP", "Utility begins with verified work—not issuance alone or a conventional monetary chain."],
          ].map(([title, copy]) => (
            <article key={title} className="bg-background p-7">
              <h3 className="font-mono text-xs tracking-[0.18em] text-cyan-300 uppercase">
                {title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="dictionary">
        <div className="grid gap-12 lg:grid-cols-[0.58fr_1.42fr] lg:gap-20">
          <div>
            <p className="section-label">Blockchain dictionary</p>
            <h2 className="section-title mt-5">CHIP, defined.</h2>
            <p className="section-body mt-6">
              A compact vocabulary for the category GRID is introducing to the
              crypto community.
            </p>
          </div>
          <dl className="border-t border-foreground/15">
            {dictionary.map((entry) => (
              <div
                key={entry.term}
                className="grid gap-4 border-b border-foreground/15 py-7 sm:grid-cols-[10rem_1fr] sm:gap-8"
              >
                <dt>
                  <strong className="block text-xl font-semibold text-foreground">
                    {entry.term}
                  </strong>
                  <span className="mt-2 block font-mono text-[0.65rem] text-cyan-300/75">
                    {entry.pronunciation}
                  </span>
                </dt>
                <dd>
                  <p className="font-mono text-[0.65rem] tracking-[0.16em] text-muted uppercase">
                    {entry.kind}
                  </p>
                  <p className="mt-3 text-base leading-7 text-muted">
                    {entry.definition}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section>
        <p className="section-label">Three forms · distinct roles</p>
        <h2 className="section-title mt-5 max-w-4xl">Token → CHIP ← Coin</h2>
        <div className="mt-12 grid gap-px bg-foreground/10 lg:grid-cols-3">
          {distinctions.map((item) => (
            <article key={item.label} className="min-h-72 bg-background p-7 sm:p-9">
              <p className="font-mono text-xs tracking-[0.2em] text-cyan-300 uppercase">
                {item.label}
              </p>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-muted">{item.copy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="section-label">How it works · public architecture</p>
            <h2 className="section-title mt-5">Value begins with verified work.</h2>
            <p className="section-body mt-6">
              CHIP exists because “token” describes portability and “coin” describes
              a native chain, but neither word fully describes utility born inside a
              compute network and carried outward for settlement.
            </p>
            <div className="mt-8 border-l-2 border-cyan-300/45 bg-cyan-300/[0.055] p-5">
              <p className="font-mono text-[0.65rem] tracking-[0.16em] text-cyan-300 uppercase">
                Deliberate boundary
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                This page explains roles and verification flow. Private keys,
                anti-abuse controls, operator thresholds, signing internals, and
                deployment details are intentionally outside this public overview.
              </p>
            </div>
          </div>
          <div className="space-y-px bg-foreground/10">
            {[
              ["Compute", "GRID begins when independent machines perform useful work."],
              ["Truth", "The GRID chain records signed receipts, contribution, and settlement history."],
              ["Portability", "Solana provides a fast public token rail for ownership and movement."],
              ["Settlement", "Bitcoin remains the preferred final Transact Security Layer."],
            ].map(([title, copy], index) => (
              <div key={title} className="grid gap-3 bg-background p-6 sm:grid-cols-[3rem_8rem_1fr] sm:items-baseline">
                <span className="font-mono text-xs text-cyan-300/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong className="text-foreground">{title}</strong>
                <span className="text-sm leading-relaxed text-muted">{copy}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="border border-cyan-300/30 bg-cyan-300/[0.055] p-7 sm:p-10">
          <p className="font-mono text-xs tracking-[0.2em] text-cyan-300 uppercase">
            GRID definition
          </p>
          <blockquote className="mt-6 max-w-5xl text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl">
            “A CHIP is computational utility with its own verifiable history,
            designed to travel through public token rails toward durable coin settlement.”
          </blockquote>
          <p className="mt-7 max-w-3xl text-sm leading-relaxed text-muted">
            CHIP is terminology used by GRID to explain its architecture. It is not
            presented as an established cryptographic standard or a separate promise
            of financial value.
          </p>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
