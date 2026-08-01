"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  OTG27_TICKETS,
  type Otg27TicketId,
} from "@/lib/otg27-tickets";

type PublicOrder = {
  id: string;
  ticketName: string;
  quantity: number;
  totalUsd: number;
  paymentNote: string;
};

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="mt-2 flex w-full items-center justify-between border border-foreground/15 bg-background/40 px-3 py-2 font-mono text-xs text-foreground/70 transition hover:border-[var(--otg-signal)]/60"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      <span className="truncate">{value}</span>
      <span className="ml-3 text-[0.6rem] tracking-[0.16em] uppercase">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

export function Otg27Tickets() {
  const [selected, setSelected] = useState<Otg27TicketId | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [cashAppUrl, setCashAppUrl] = useState("");
  const [cashtag, setCashtag] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [method, setMethod] = useState<"cash_app" | "bitcoin">("cash_app");
  const [reference, setReference] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selected]);

  const close = () => {
    setSelected(null);
    setOrder(null);
    setDone(false);
    setError("");
  };

  async function startOrder(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/otg/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "start",
          ticketId: selected,
          quantity,
          name,
          email,
          organization,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error);
      setOrder(data.order);
      setCashAppUrl(data.cashAppUrl);
      setCashtag(data.cashtag);
      setBtcAddress(data.btcAddress);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPayment(event: FormEvent) {
    event.preventDefault();
    if (!order) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/otg/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "submit_payment",
          id: order.id,
          paymentMethod: method,
          paymentReference: reference,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error);
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="grid gap-px border border-foreground/12 bg-foreground/12 lg:grid-cols-3">
        {OTG27_TICKETS.map((ticket) => (
          <article
            key={ticket.id}
            className={`relative flex min-h-[30rem] flex-col bg-[var(--otg-card-bg)] p-6 sm:p-8 ${
              "featured" in ticket && ticket.featured
                ? "otg-ticket-featured"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-foreground/35">
                PASS / {ticket.marker}
              </span>
              {"featured" in ticket && ticket.featured && (
                <span className="bg-[var(--otg-signal)] px-2 py-1 text-[0.6rem] font-bold tracking-[0.16em] text-[var(--otg-signal-fg)] uppercase">
                  Full signal
                </span>
              )}
            </div>
            <h3 className="mt-14 text-2xl font-semibold tracking-[-0.03em]">
              {ticket.name}
            </h3>
            <p className="mt-3 min-h-16 text-sm leading-relaxed text-foreground/45">
              {ticket.description}
            </p>
            <div className="mt-8 flex items-start gap-1">
              <span className="mt-2 text-sm text-foreground/40">$</span>
              <span className="text-6xl font-semibold tracking-[-0.07em]">
                {ticket.price}
              </span>
            </div>
            <p className="mt-1 font-mono text-[0.65rem] tracking-[0.15em] text-foreground/30 uppercase">
              USD · per person
            </p>
            <ul className="mt-8 space-y-3 border-t border-foreground/10 pt-6">
              {ticket.includes.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-foreground/60"
                >
                  <span className="text-[var(--otg-signal)]">+</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <button
                type="button"
                onClick={() => setSelected(ticket.id)}
                className={`w-full ${
                  "featured" in ticket && ticket.featured
                    ? "otg-btn-signal"
                    : "btn-ghost"
                }`}
              >
                Get {ticket.name}
              </button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-background/85 backdrop-blur-md sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="otg-checkout-title"
          onClick={(event) => event.target === event.currentTarget && close()}
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto border border-foreground/15 bg-[var(--otg-card-bg)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-foreground/10 p-5">
              <div>
                <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[var(--otg-signal)] uppercase">
                  OTG27 / Ticket
                </p>
                <h2
                  id="otg-checkout-title"
                  className="mt-1 text-xl font-semibold"
                >
                  {OTG27_TICKETS.find((ticket) => ticket.id === selected)?.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="border border-foreground/15 px-3 py-1.5 text-xs text-foreground/50 uppercase hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {error && (
                <p className="mb-4 border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
                  {error}
                </p>
              )}

              {done ? (
                <div className="py-8 text-center">
                  <p className="font-mono text-xs tracking-[0.2em] text-[var(--otg-signal)] uppercase">
                    Signal received
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold">
                    You&apos;re on the GRID.
                  </h3>
                  <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-foreground/50">
                    Your payment submission is recorded. Keep your payment note
                    for confirmation and event updates.
                  </p>
                  <button type="button" onClick={close} className="btn-primary mt-8">
                    Back to OTG27
                  </button>
                </div>
              ) : !order ? (
                <form onSubmit={startOrder} className="space-y-4">
                  <label className="block">
                    <span className="otg-field-label">Name *</span>
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="otg-field"
                      autoComplete="name"
                    />
                  </label>
                  <label className="block">
                    <span className="otg-field-label">Email *</span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="otg-field"
                      autoComplete="email"
                    />
                  </label>
                  <label className="block">
                    <span className="otg-field-label">
                      Organization / school
                    </span>
                    <input
                      value={organization}
                      onChange={(event) => setOrganization(event.target.value)}
                      className="otg-field"
                    />
                  </label>
                  <label className="block">
                    <span className="otg-field-label">Quantity</span>
                    <select
                      value={quantity}
                      onChange={(event) => setQuantity(Number(event.target.value))}
                      className="otg-field"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="otg-btn-signal w-full disabled:opacity-40"
                  >
                    {busy ? "Creating pass…" : "Continue to payment"}
                  </button>
                  <p className="text-center text-xs leading-relaxed text-foreground/30">
                    Student tickets require valid student ID at check-in.
                  </p>
                </form>
              ) : (
                <form onSubmit={submitPayment} className="space-y-5">
                  <div className="border border-foreground/10 bg-foreground/[0.03] p-4">
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-foreground/50">
                        {order.ticketName} × {order.quantity}
                      </span>
                      <strong>${order.totalUsd}</strong>
                    </div>
                    <p className="mt-4 text-[0.6rem] tracking-[0.16em] text-foreground/30 uppercase">
                      Required payment note
                    </p>
                    <CopyValue value={order.paymentNote} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod("cash_app")}
                      className={`border px-3 py-3 text-xs tracking-[0.12em] uppercase ${
                        method === "cash_app"
                          ? "border-[var(--otg-signal)] text-[var(--otg-signal)]"
                          : "border-foreground/15 text-foreground/45"
                      }`}
                    >
                      Cash App
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("bitcoin")}
                      className={`border px-3 py-3 text-xs tracking-[0.12em] uppercase ${
                        method === "bitcoin"
                          ? "border-[var(--otg-signal)] text-[var(--otg-signal)]"
                          : "border-foreground/15 text-foreground/45"
                      }`}
                    >
                      Bitcoin
                    </button>
                  </div>

                  {method === "cash_app" ? (
                    <div>
                      <p className="text-sm text-foreground/50">
                        Pay {cashtag} using the exact note above.
                      </p>
                      <a
                        href={cashAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="otg-btn-signal mt-3 w-full"
                      >
                        Open Cash App · ${order.totalUsd}
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-foreground/50">
                        Send the USD equivalent in BTC to:
                      </p>
                      <CopyValue value={btcAddress} />
                    </div>
                  )}

                  <label className="block">
                    <span className="otg-field-label">
                      {method === "bitcoin"
                        ? "Transaction ID"
                        : "Cash App confirmation"}
                    </span>
                    <input
                      value={reference}
                      onChange={(event) => setReference(event.target.value)}
                      className="otg-field"
                      placeholder="Optional payment reference"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-primary w-full disabled:opacity-40"
                  >
                    {busy ? "Submitting…" : "I sent payment"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
