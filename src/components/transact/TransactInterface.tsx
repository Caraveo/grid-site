"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

type Direction = "buy" | "sell";

const steps = [
  ["01", "GRID account", "Authenticated session + passkey ready"],
  ["02", "Identity", "Stripe KYC and sanctions screening"],
  ["03", "Funding", "Card, bank, Apple Pay, or USDC"],
  ["04", "Exchange", "Disclosed GEX quote and custody boundary"],
  ["05", "Delivery", "GRID to Phoenix or verified GRID address"],
];

const controls = [
  "No card or bank credentials touch GRID servers",
  "No transaction without an authenticated account",
  "No GRID delivery before confirmed USDC settlement",
  "No hidden spread, invented rate, or guaranteed return",
  "Every state transition receives an immutable audit event",
  "Live settlement remains disabled until written approvals",
];

export function TransactInterface() {
  const [direction, setDirection] = useState<Direction>("buy");
  const [amount, setAmount] = useState("100");
  const [address, setAddress] = useState("");
  const [session, setSession] = useState<{
    authenticated: boolean;
    username: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/transact/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { authenticated?: boolean; username?: string | null }) => {
        if (active) {
          setSession({
            authenticated: Boolean(data.authenticated),
            username: data.username ?? null,
          });
        }
      })
      .catch(() => {
        if (active) setSession({ authenticated: false, username: null });
      });
    return () => {
      active = false;
    };
  }, []);

  const amountLabel = direction === "buy" ? "You fund" : "You sell";
  const sourceUnit = direction === "buy" ? "USD" : "GRID";
  const destinationUnit = direction === "buy" ? "GRID" : "USDC";

  return (
    <main className="min-h-screen bg-[#050708] text-white">
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-20">
          <Link href="/" className="flex items-center gap-3" aria-label="GRID home">
            <Logo className="size-7" />
            <span className="text-sm font-semibold tracking-[0.3em]">GRID</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 font-mono text-[0.62rem] tracking-[0.12em] text-amber-200 uppercase sm:flex">
              <span className="size-1.5 rounded-full bg-amber-300" />
              Sandbox · operations pending
            </span>
            {session?.authenticated ? (
              <span className="border border-emerald-300/25 bg-emerald-300/[0.06] px-4 py-2 font-mono text-[0.65rem] tracking-[0.1em] text-emerald-200 uppercase">
                {session.username ?? "Authenticated"}
              </span>
            ) : (
              <Link
                href="/login?returnTo=%2Ftransact"
                className="border border-white/20 px-4 py-2 font-mono text-[0.65rem] tracking-[0.12em] uppercase transition hover:border-white"
              >
                {session === null ? "Checking session" : "Sign in"}
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-35" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-cyan-200 uppercase">
              transact.grid-compute.com
            </p>
            <h1 className="mt-5 max-w-4xl text-[clamp(3rem,7vw,6.4rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
              Fund in dollars.
              <br />
              <span className="text-cyan-200">Settle in GRID.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
              A compliance-first path from approved fiat funding to USDC, then
              through a disclosed GEX quote into native GRID custody.
            </p>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {[
              ["Stripe", "Fiat + KYC"],
              ["USDC", "Settlement"],
              ["GRID", "Delivery"],
            ].map(([title, detail], index) => (
              <div key={title} className="relative bg-black/80 p-5">
                <p className="font-mono text-[0.58rem] tracking-[0.14em] text-white/30 uppercase">
                  0{index + 1}
                </p>
                <p className="mt-4 text-xl font-semibold">{title}</p>
                <p className="mt-1 text-xs text-white/40">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.72fr]">
          <div className="border border-white/12 bg-white/[0.025]">
            <div className="flex border-b border-white/10 p-1">
              {(["buy", "sell"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDirection(option)}
                  className={`flex-1 px-4 py-3 font-mono text-xs tracking-[0.15em] uppercase transition ${
                    direction === option
                      ? "bg-white text-black"
                      : "text-white/45 hover:text-white"
                  }`}
                >
                  {option} GRID
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-8">
              {direction === "sell" && (
                <div className="mb-6 border border-amber-300/25 bg-amber-300/[0.06] p-4 text-sm leading-relaxed text-amber-100/75">
                  Sell/off-ramp is a staged interface only. It will remain
                  unavailable until an approved payout and compliance partner
                  supports GRID’s operating jurisdictions.
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[0.62rem] tracking-[0.12em] text-white/45 uppercase">
                    {amountLabel}
                  </span>
                  <div className="mt-2 flex border border-white/15 bg-black/40 focus-within:border-cyan-200/70">
                    <input
                      value={amount}
                      onChange={(event) =>
                        setAmount(event.target.value.replace(/[^0-9.]/g, "").slice(0, 10))
                      }
                      inputMode="decimal"
                      aria-label={`${amountLabel} in ${sourceUnit}`}
                      className="min-w-0 flex-1 bg-transparent px-4 py-4 text-2xl font-semibold outline-none"
                    />
                    <span className="grid place-items-center border-l border-white/10 px-4 font-mono text-xs text-white/50">
                      {sourceUnit}
                    </span>
                  </div>
                </label>

                <div>
                  <span className="font-mono text-[0.62rem] tracking-[0.12em] text-white/45 uppercase">
                    You receive
                  </span>
                  <div className="mt-2 flex min-h-[62px] items-center justify-between border border-white/10 bg-white/[0.025] px-4">
                    <span className="text-sm text-white/35">Live quote at confirmation</span>
                    <span className="font-mono text-xs text-cyan-200">{destinationUnit}</span>
                  </div>
                </div>
              </div>

              <label className="mt-5 block">
                <span className="font-mono text-[0.62rem] tracking-[0.12em] text-white/45 uppercase">
                  {direction === "buy" ? "GRID destination address" : "USDC destination wallet"}
                </span>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value.slice(0, 128))}
                  placeholder={
                    direction === "buy"
                      ? "Connect Phoenix or enter grid01…"
                      : "Connect an approved Solana wallet"
                  }
                  className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-4 font-mono text-sm outline-none transition placeholder:text-white/20 focus:border-cyan-200/70"
                />
              </label>

              <div className="mt-6 grid gap-3 border-y border-white/10 py-5 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-white/30">Rate</p>
                  <p className="mt-1 font-mono text-white/70">Disclosed live</p>
                </div>
                <div>
                  <p className="text-white/30">Fees</p>
                  <p className="mt-1 font-mono text-white/70">Itemized first</p>
                </div>
                <div>
                  <p className="text-white/30">Quote expiry</p>
                  <p className="mt-1 font-mono text-white/70">Before signing</p>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed border border-amber-300/30 bg-amber-300/[0.08] px-6 py-4 font-mono text-xs tracking-[0.13em] text-amber-100/65 uppercase"
              >
                Live operations approval required
              </button>
              <p className="mt-3 text-center text-xs leading-relaxed text-white/30">
                This sandbox never collects payment credentials or transfers assets.
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <section className="border border-cyan-300/20 bg-cyan-300/[0.035] p-6">
              <p className="font-mono text-[0.62rem] tracking-[0.14em] text-cyan-200 uppercase">
                Authentication + KYC
              </p>
              <h2 className="mt-4 text-2xl font-semibold">Identity before money.</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/45">
                GRID authentication establishes the customer session and destination
                wallet. Stripe’s approved onramp performs payment authentication,
                identity checks, and sanctions screening in its hosted experience.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Session", "Passkey", "Stripe KYC", "Wallet proof"].map((item) => (
                  <span
                    key={item}
                    className="border border-white/10 px-2.5 py-1.5 font-mono text-[0.58rem] tracking-[0.08em] text-white/55 uppercase"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="border border-white/10 p-6">
              <p className="font-mono text-[0.62rem] tracking-[0.14em] text-white/35 uppercase">
                Custody boundary
              </p>
              <ol className="mt-5 space-y-4">
                {[
                  ["Stripe / Link", "Card or bank authorization; approved USDC purchase"],
                  ["Customer wallet", "USDC arrives under the customer’s control"],
                  ["GEX order", "Customer authorizes the quoted USDC settlement"],
                  ["Phoenix / GRID", "Native GRID delivered to the verified address"],
                ].map(([title, detail], index) => (
                  <li key={title} className="grid grid-cols-[1.5rem_1fr] gap-3">
                    <span className="font-mono text-xs text-cyan-200/60">{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/35">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </section>

      <section className="border-y border-white/10 px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr]">
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.14em] text-cyan-200 uppercase">
                Transaction lifecycle
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Nothing happens silently.</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/40">
                Each step has a state, an authority, and an auditable timestamp.
              </p>
            </div>
            <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-5">
              {steps.map(([number, title, detail]) => (
                <article key={number} className="bg-black/85 p-5">
                  <p className="font-mono text-[0.6rem] text-cyan-200/55">{number}</p>
                  <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/35">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.14em] text-emerald-200 uppercase">
              Control policy
            </p>
            <h2 className="mt-4 text-3xl font-semibold">Designed not to scam.</h2>
            <div className="mt-7 grid gap-3">
              {controls.map((control) => (
                <div key={control} className="flex gap-3 border border-white/10 p-4 text-sm text-white/55">
                  <span className="text-emerald-300">✓</span>
                  {control}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.14em] text-white/35 uppercase">
              Audit event preview
            </p>
            <div className="mt-4 overflow-hidden border border-white/10 bg-black font-mono text-xs">
              {[
                ["10:14:02.104", "session.authenticated", "customer"],
                ["10:14:18.771", "kyc.redirected", "stripe"],
                ["10:16:44.019", "kyc.approved", "stripe_webhook"],
                ["10:17:03.442", "quote.created", "gex"],
                ["—", "settlement.awaiting_authorization", "customer"],
              ].map(([time, event, actor]) => (
                <div key={event} className="grid grid-cols-[6.8rem_1fr] gap-3 border-b border-white/[0.07] px-4 py-3 last:border-0 sm:grid-cols-[7rem_1fr_8rem]">
                  <span className="text-white/25">{time}</span>
                  <span className="text-cyan-100/70">{event}</span>
                  <span className="hidden text-right text-white/25 sm:block">{actor}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/30">
              Production audit records store identifiers, state changes, provider
              references, and hashed request context—never card data or private keys.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>GRID Transact sandbox · no live payments or asset transfers</p>
          <div className="flex gap-5">
            <Link href="/dictionary" className="hover:text-white">Dictionary</Link>
            <Link href="/chip" className="hover:text-white">CHIP policy</Link>
            <Link href="/alloc" className="hover:text-white">Allocation</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
