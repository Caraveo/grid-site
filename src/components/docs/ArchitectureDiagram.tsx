const node =
  "rounded-2xl border border-border/80 bg-surface/80 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)]";

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex min-h-12 items-center justify-center gap-2 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-dim md:flex-col">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#50F01C]/70 to-transparent md:h-7 md:w-px md:flex-none md:bg-gradient-to-b" />
      <span>{label}</span>
      <span className="text-[#50F01C]" aria-hidden="true">
        ↓
      </span>
    </div>
  );
}

function RepoLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mt-2 inline-flex rounded-md border border-[#50F01C]/20 bg-[#50F01C]/8 px-2 py-1 font-mono text-[10px] text-[#50F01C]">
      {children}
    </span>
  );
}

export function ArchitectureDiagram() {
  return (
    <figure
      className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(80,240,28,0.12),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.035),transparent)] p-4 sm:p-6"
      aria-labelledby="grid-architecture-caption"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(80,240,28,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(80,240,28,.7) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative">
        <div className="grid gap-3 md:grid-cols-3">
          <section className={node}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              People + devices
            </p>
            <h3 className="mt-2 font-semibold text-fg-strong">
              Operators and wallets
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Node operators use the CLI. ARK signs locally on iPhone, Mac, and
              Android without exposing private keys.
            </p>
          </section>

          <section className={`${node} border-[#50F01C]/35`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#50F01C]">
              Native custody boundary
            </p>
            <h3 className="mt-2 font-semibold text-fg-strong">ARK wallets</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Encrypted QR pairing, Keychain or Keystore custody, local signing,
              and nonce-based replay protection.
            </p>
            <RepoLabel>Caraveo/grid-wallets</RepoLabel>
          </section>

          <section className={node}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              Public edge
            </p>
            <h3 className="mt-2 font-semibold text-fg-strong">
              Website + secure API
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Native downloads live at grid-compute.com. Signed envelopes enter
              through ark.grid-compute.com.
            </p>
          </section>
        </div>

        <Arrow label="signed requests only" />

        <div className="grid gap-3 md:grid-cols-[1fr_1.35fr_1fr]">
          <section className={node}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              Useful work
            </p>
            <h3 className="mt-2 font-semibold text-fg-strong">Coordinator</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Assigns authorized work and verifies results before producing
              settlement receipts.
            </p>
          </section>

          <section className={`${node} border-[#50F01C]/45 bg-[#50F01C]/6`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#50F01C]">
                  Protocol core
                </p>
                <h3 className="mt-2 font-semibold text-fg-strong">
                  GRID node + CLI
                </h3>
              </div>
              <span className="rounded-md bg-[#50F01C] px-2 py-1 font-mono text-[10px] font-semibold text-black">
                v0.2.29
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Verifies ARK signatures, rejects replayed nonces, runs useful
              compute, maintains chain state, and speaks encrypted P2P.
            </p>
            <RepoLabel>Caraveo/grid</RepoLabel>
          </section>

          <section className={node}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              Independent replicas
            </p>
            <h3 className="mt-2 font-semibold text-fg-strong">P2P peers</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Replicate blocks and independently verify signatures, links,
              state roots, and deterministic allocation.
            </p>
          </section>
        </div>

        <Arrow label="verified settlements + replicated state" />

        <section className={`${node} mx-auto max-w-2xl border-[#50F01C]/35`}>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full border border-[#50F01C]/50 bg-[#50F01C]/10 shadow-[0_0_40px_rgba(80,240,28,0.14)]">
              <span className="font-mono text-sm font-semibold text-[#50F01C]">
                GENESIS
              </span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#50F01C]">
                Current canonical authority
              </p>
              <h3 className="mt-2 font-semibold text-fg-strong">
                Signed settlement chain
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                The truth service, block producer, and bootstrap peer publish the
                canonical Phase 1 chain. Multi-validator finality remains a
                mainnet milestone.
              </p>
            </div>
          </div>
        </section>
      </div>

      <figcaption
        id="grid-architecture-caption"
        className="relative mt-5 border-t border-border/70 pt-4 text-xs leading-relaxed text-muted"
      >
        Trust boundary: wallet secrets remain on the user&apos;s device. The
        network receives signed envelopes and independently verifies them before
        state changes are accepted.
      </figcaption>
    </figure>
  );
}
import type { ReactNode } from "react";
