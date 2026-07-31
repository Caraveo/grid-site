const nodeClass =
  "token-block flex min-h-28 flex-col justify-between rounded-sm border border-white/12 bg-white/[0.035] p-5";

function Arrow() {
  return (
    <div className="flex items-center justify-center py-2 lg:px-2 lg:py-0" aria-hidden="true">
      <div className="hidden h-px w-full bg-gradient-to-r from-white/15 via-cyan-300/80 to-white/15 lg:block" />
      <div className="h-10 w-px bg-gradient-to-b from-white/15 via-cyan-300/80 to-white/15 lg:hidden" />
    </div>
  );
}

export function ConsolidationDiagram() {
  return (
    <figure
      className="token-block rounded-sm border border-white/12 bg-black/20 p-4 sm:p-7"
      aria-labelledby="consolidation-caption"
    >
      <div className="grid items-stretch lg:grid-cols-[1fr_3rem_1fr_3rem_1fr]">
        <div className={nodeClass}>
          <div className="flex items-center justify-between">
            <span className="text-[0.62rem] font-semibold tracking-[0.24em] text-white/35 uppercase">
              Compute layer
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.8)]" />
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Useful work</p>
            <p className="mt-1 text-sm leading-relaxed text-white/45">
              Nodes complete jobs. The network verifies the result.
            </p>
          </div>
        </div>
        <Arrow />
        <div className={`${nodeClass} border-cyan-300/30 bg-cyan-300/[0.055]`}>
          <div className="flex items-center justify-between">
            <span className="text-[0.62rem] font-semibold tracking-[0.24em] text-cyan-200/60 uppercase">
              Token rail
            </span>
            <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-cyan-200">
              GRID · SOL
            </span>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Consolidate</p>
            <p className="mt-1 text-sm leading-relaxed text-white/45">
              GRID meters value; Solana moves and records it efficiently.
            </p>
          </div>
        </div>
        <Arrow />
        <div className={`${nodeClass} border-amber-200/25 bg-amber-200/[0.045]`}>
          <div className="flex items-center justify-between">
            <span className="text-[0.62rem] font-semibold tracking-[0.24em] text-amber-100/55 uppercase">
              Settlement layer
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_18px_rgba(253,230,138,.65)]" />
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Bitcoin TSL</p>
            <p className="mt-1 text-sm leading-relaxed text-white/45">
              Bitcoin remains the final value and security destination.
            </p>
          </div>
        </div>
      </div>
      <figcaption
        id="consolidation-caption"
        className="mt-5 border-t border-white/8 pt-4 text-xs leading-relaxed text-white/35"
      >
        Public architecture view. Internal issuance, custody, and security controls are intentionally omitted.
      </figcaption>
    </figure>
  );
}

export function SolanaLedgerDiagram() {
  return (
    <figure
      className="token-block relative overflow-hidden rounded-sm border border-white/12 bg-black/20 p-6 sm:p-9"
      aria-labelledby="solana-caption"
    >
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(103,232,249,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,.1)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="relative grid items-center gap-8 md:grid-cols-[1fr_1.25fr_1fr]">
        <div className="space-y-3">
          {["GRID wallet", "Compute market", "Settlement app"].map((label) => (
            <div key={label} className="token-block rounded-sm border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/65">
              {label}
            </div>
          ))}
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-64 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-300/15" />
          <div className="absolute inset-[12%] rounded-full border border-dashed border-cyan-300/25 animate-[spin_24s_linear_infinite]" />
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const angle = (index * Math.PI * 2) / 6;
            const x = 50 + Math.cos(angle) * 42;
            const y = 50 + Math.sin(angle) * 42;
            return (
              <span
                key={index}
                className="absolute h-2.5 w-2.5 rounded-full border border-cyan-100/50 bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.65)]"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              />
            );
          })}
          <div className="token-block relative rounded-full border border-cyan-300/35 bg-[#071416] px-6 py-7 text-center shadow-[0_0_55px_rgba(34,211,238,.12)]">
            <p className="text-[0.62rem] font-semibold tracking-[0.24em] text-cyan-200/60 uppercase">
              Network
            </p>
            <p className="mt-1 text-xl font-semibold text-white">Solana</p>
            <p className="mt-1 text-xs text-white/35">shared ledger</p>
          </div>
        </div>

        <div className="space-y-3">
          {["Sign", "Validate", "Confirm"].map((label, index) => (
            <div key={label} className="token-block flex items-center gap-3 rounded-sm border border-white/10 bg-black/50 px-4 py-3">
              <span className="font-mono text-xs text-cyan-200/55">0{index + 1}</span>
              <span className="text-sm text-white/65">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption id="solana-caption" className="relative mt-7 text-center text-xs leading-relaxed text-white/35">
        Wallets sign instructions. Validators agree on their order. The shared ledger records the result.
      </figcaption>
    </figure>
  );
}

export function AssetRolesDiagram() {
  const assets = [
    {
      mark: "G",
      title: "GRID",
      role: "Utility unit",
      copy: "Meters verified compute and moves value inside the GRID economy.",
      accent: "border-emerald-300/25 text-emerald-200",
    },
    {
      mark: "S",
      title: "SOL",
      role: "Network fuel",
      copy: "Pays Solana network fees. SOL is not GRID and does not represent ownership in GRID.",
      accent: "border-cyan-300/25 text-cyan-200",
    },
    {
      mark: "₿",
      title: "BTC",
      role: "Final settlement",
      copy: "The Transact Security Layer for long-term value and final settlement.",
      accent: "border-amber-200/25 text-amber-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {assets.map((asset) => (
        <article key={asset.title} className="panel rounded-sm p-6">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full border bg-black/30 font-mono text-lg ${asset.accent}`}>
            {asset.mark}
          </div>
          <p className="mt-7 text-[0.65rem] font-semibold tracking-[0.22em] text-white/35 uppercase">
            {asset.role}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{asset.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/45">{asset.copy}</p>
        </article>
      ))}
    </div>
  );
}
