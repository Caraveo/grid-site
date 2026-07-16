const surfaces = [
  {
    title: "Software",
    body: "Desktop wallet for miners — run nodes, see earn, export keys, GRID → BTC.",
    phase: "P2",
  },
  {
    title: "Mobile",
    body: "Watch balances and alerts on the go. Later: sign and cash out to Bitcoin.",
    phase: "P3–P4",
  },
  {
    title: "Web",
    body: "Buyer portal for jobs and invoices. Connect a wallet — no seed in the browser.",
    phase: "P2–P3",
  },
  {
    title: "Services",
    body: "Fleet APIs, payroll to BTC, SSO, audit. Optional custody for teams who need it.",
    phase: "P3+",
  },
];

export function Wallets() {
  return (
    <section
      id="wallets"
      className="relative border-t border-white/10 px-5 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="section-label">Edge wallets</p>
          <h2 className="section-title mt-5">
            Keys at the edge.
            <br />
            Exit on Bitcoin.
          </h2>
          <p className="section-body mt-6">
            CLI first. Then software, mobile, web, and services — same identity
            story, non-custodial by default, Bitcoin as the Transact Security
            Layer for hard settlement.
          </p>
        </div>

        <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {surfaces.map((s) => (
            <div
              key={s.title}
              className="bg-black p-8 transition hover:bg-white/[0.03]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  {s.title}
                </h3>
                <span className="font-mono text-[0.6rem] tracking-[0.14em] text-white/35 uppercase">
                  {s.phase}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/50">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
