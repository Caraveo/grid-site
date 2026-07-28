const treasuryBuckets = [
  { label: "Development + grants", amount: "1.50B", percent: 30, color: "#67e8f9" },
  { label: "Security + operations", amount: "750M", percent: 15, color: "#a5b4fc" },
  { label: "Founder", amount: "500M", percent: 10, color: "#f0abfc" },
  { label: "Contributors", amount: "500M", percent: 10, color: "#c4b5fd" },
  { label: "Community launch", amount: "750M", percent: 15, color: "#6ee7b7" },
  { label: "Liquidity", amount: "750M", percent: 15, color: "#fde68a" },
  { label: "Emergency reserve", amount: "250M", percent: 5, color: "#fca5a5" },
];

export function SupplySplitDiagram() {
  return (
    <figure aria-labelledby="supply-split-caption">
      <div className="grid overflow-hidden rounded-sm border border-white/12 sm:grid-cols-2">
        <div className="relative min-h-56 bg-cyan-300/[0.07] p-7 sm:min-h-72 sm:p-9">
          <div className="absolute inset-x-0 top-0 h-1 bg-cyan-300" />
          <p className="font-mono text-xs tracking-[0.2em] text-cyan-200/65 uppercase">50%</p>
          <p className="mt-5 text-5xl font-semibold tracking-tight text-white sm:text-6xl">5B</p>
          <p className="mt-2 text-lg font-semibold text-white">Compute mining</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
            Issued only for verified work, subject to a 25,000 GRID hourly ceiling.
          </p>
        </div>
        <div className="relative min-h-56 border-t border-white/12 bg-violet-300/[0.055] p-7 sm:min-h-72 sm:border-t-0 sm:border-l sm:p-9">
          <div className="absolute inset-x-0 top-0 h-1 bg-violet-300" />
          <p className="font-mono text-xs tracking-[0.2em] text-violet-200/65 uppercase">50%</p>
          <p className="mt-5 text-5xl font-semibold tracking-tight text-white sm:text-6xl">5B</p>
          <p className="mt-2 text-lg font-semibold text-white">Treasury allocation</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
            Divided into seven disclosed buckets with separate release controls.
          </p>
        </div>
      </div>
      <figcaption id="supply-split-caption" className="mt-4 text-xs leading-relaxed text-white/35">
        Planned mainnet maximum: 10,000,000,000 GRID. Devnet tokens are test assets and are not part of this allocation.
      </figcaption>
    </figure>
  );
}

export function TreasuryBarDiagram() {
  return (
    <figure aria-labelledby="treasury-bar-caption">
      <div className="flex h-10 overflow-hidden rounded-sm border border-white/12 bg-black/30">
        {treasuryBuckets.map((bucket) => (
          <div
            key={bucket.label}
            style={{ width: `${bucket.percent}%`, backgroundColor: bucket.color }}
            title={`${bucket.label}: ${bucket.amount}`}
          />
        ))}
      </div>
      <div className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {treasuryBuckets.map((bucket) => (
          <div key={bucket.label} className="flex items-start gap-3">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: bucket.color }} />
            <div>
              <p className="text-sm font-medium text-white">{bucket.label}</p>
              <p className="mt-0.5 font-mono text-xs text-white/35">
                {bucket.amount} · {bucket.percent}% of treasury
              </p>
            </div>
          </div>
        ))}
      </div>
      <figcaption id="treasury-bar-caption" className="mt-6 text-xs leading-relaxed text-white/35">
        The seven treasury buckets total exactly 5,000,000,000 GRID.
      </figcaption>
    </figure>
  );
}

export function FounderVestingDiagram() {
  return (
    <figure className="panel rounded-sm p-6 sm:p-8" aria-labelledby="founder-vesting-caption">
      <div className="grid gap-3 sm:grid-cols-[1fr_4fr]">
        <div className="flex min-h-28 flex-col justify-between rounded-sm border border-fuchsia-200/20 bg-fuchsia-200/[0.045] p-4">
          <span className="font-mono text-xs text-fuchsia-100/50">YEAR 1</span>
          <div>
            <p className="font-semibold text-white">Cliff</p>
            <p className="mt-1 text-xs text-white/35">0 GRID vested</p>
          </div>
        </div>
        <div className="relative flex min-h-28 flex-col justify-between overflow-hidden rounded-sm border border-white/12 bg-white/[0.025] p-4">
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-fuchsia-300/[0.04] to-fuchsia-300/[0.13]" />
          <div className="relative flex justify-between font-mono text-xs text-white/30">
            <span>YEAR 2</span><span>YEAR 3</span><span>YEAR 4</span><span>YEAR 5</span>
          </div>
          <div className="relative">
            <p className="font-semibold text-white">Monthly vesting</p>
            <p className="mt-1 text-xs text-white/35">500M released evenly across 48 months</p>
          </div>
        </div>
      </div>
      <figcaption id="founder-vesting-caption" className="mt-5 text-xs leading-relaxed text-white/35">
        Founder allocation: 500,000,000 GRID, or 5% of total maximum supply. No unilateral early unlock.
      </figcaption>
    </figure>
  );
}
