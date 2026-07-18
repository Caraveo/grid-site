"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  startRegistration as webauthnRegister,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import { ScrambleText } from "./ScrambleText";

type Step = "name" | "passkey" | "pay" | "confirm" | "done";

type StartResponse = {
  ok: boolean;
  error?: string;
  registration?: {
    id: string;
    name: string;
    label: string;
    class: string;
    region: string;
    status: string;
    feeUsd: number;
    paymentNote: string;
    hasPasskey?: boolean;
  };
  cashAppUrl?: string;
  cashtag?: string;
  feeUsd?: number;
  instructions?: string[];
  payment?: {
    method: string;
    cashtag: string;
    feeUsd: number;
    note: string;
    url: string;
  };
};

const CASHTAG = "$Caraveo";

export function RegisterFlow() {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [klass, setKlass] = useState("S");
  const [region, setRegion] = useState("NA-W");
  const [asNode, setAsNode] = useState(true);
  const [asCompute, setAsCompute] = useState(true);
  const [identityKeyOk, setIdentityKeyOk] = useState(false);
  const [identityKeySupported, setIdentityKeySupported] = useState(false);
  const [avail, setAvail] = useState<{
    available?: boolean;
    reason?: string;
    name?: string | null;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reg, setReg] = useState<StartResponse["registration"] | null>(null);
  const [cashUrl, setCashUrl] = useState<string | null>(null);
  const [fee, setFee] = useState(5);
  const [cashtag, setCashtag] = useState(CASHTAG);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [cashConfirm, setCashConfirm] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIdentityKeySupported(browserSupportsWebAuthn());
    fetch("/api/registry/register")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.feeUsd === "number") setFee(d.feeUsd);
        if (typeof d.cashtag === "string") setCashtag(d.cashtag);
      })
      .catch(() => {});
  }, []);

  const checkName = useCallback(async (n: string) => {
    const t = n.trim().toLowerCase();
    if (t.length < 2) {
      setAvail(null);
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(
        `/api/registry/register?name=${encodeURIComponent(t)}`,
      );
      const data = await res.json();
      setAvail(data);
    } catch {
      setAvail(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void checkName(name), 350);
    return () => clearTimeout(t);
  }, [name, checkName]);

  async function onStart(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const kinds: string[] = [];
      if (asNode) kinds.push("node");
      if (asCompute) kinds.push("compute");
      if (kinds.length === 0) {
        setError("Select at least one: node and/or compute");
        setBusy(false);
        return;
      }
      const res = await fetch("/api/registry/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "start",
          name,
          label: label || name,
          class: klass,
          region,
          kinds,
        }),
      });
      const data = (await res.json()) as StartResponse;
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not start registration");
        return;
      }
      setReg(data.registration ?? null);
      setCashUrl(data.cashAppUrl ?? data.payment?.url ?? null);
      setFee(data.feeUsd ?? data.payment?.feeUsd ?? fee);
      setCashtag(data.cashtag ?? data.payment?.cashtag ?? CASHTAG);
      setInstructions(data.instructions ?? []);
      setIdentityKeyOk(false);
      // Prefer IdentityKey step when supported
      setStep(browserSupportsWebAuthn() ? "passkey" : "pay");
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  async function onCreateIdentityKey() {
    if (!reg?.id) return;
    setError(null);
    setBusy(true);
    try {
      const optRes = await fetch("/api/registry/passkey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "register_options", regId: reg.id }),
      });
      const optData = await optRes.json();
      if (!optRes.ok || !optData.ok) {
        setError(optData.error ?? "Could not start IdentityKey");
        return;
      }

      const attResp = await webauthnRegister({
        optionsJSON: optData.options,
      });

      const verRes = await fetch("/api/registry/passkey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "register_verify",
          regId: reg.id,
          challengeKey: optData.challengeKey,
          response: attResp,
        }),
      });
      const verData = await verRes.json();
      if (!verRes.ok || !verData.ok) {
        setError(verData.error ?? "IdentityKey verification failed");
        return;
      }
      setIdentityKeyOk(true);
      setReg((r) => (r ? { ...r, hasPasskey: true } : r));
      setStep("pay");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "IdentityKey cancelled or failed";
      if (/cancel|not allowed|abort/i.test(msg)) {
        setError("IdentityKey cancelled. You can retry or continue without one.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    if (!reg?.id) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/registry/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          id: reg.id,
          cashConfirm: cashConfirm || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not confirm");
        return;
      }
      setReg(data.registration);
      setStep("done");
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  function copyNote() {
    if (!reg?.paymentNote) return;
    void navigator.clipboard.writeText(reg.paymentNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const nameOk = avail?.available === true;

  return (
    <div className="mx-auto max-w-xl">
      {/* Steps */}
      <ol className="mb-10 flex flex-wrap items-center justify-between gap-2 font-mono text-[0.55rem] tracking-[0.14em] text-white/35 uppercase sm:text-[0.6rem] sm:tracking-[0.18em]">
        {(
          [
            ["name", "1 · Name"],
            ["passkey", "2 · IdentityKey"],
            ["pay", "3 · Cash App"],
            ["confirm", "4 · Confirm"],
            ["done", "5 · Done"],
          ] as const
        ).map(([id, lab]) => (
          <li
            key={id}
            className={`${
              step === id
                ? "text-white"
                : stepOrder(step) > stepOrder(id)
                  ? "text-white/60"
                  : ""
            }`}
          >
            {lab}
          </li>
        ))}
      </ol>

      {error && (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {step === "name" && (
        <form onSubmit={onStart} className="space-y-6">
          <div>
            <label className="font-mono text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
              Public compute name
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 focus-within:border-white/40">
              <span className="font-mono text-sm text-white/40">grid://</span>
              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_-]/g, "")
                      .slice(0, 32),
                  )
                }
                placeholder="garage"
                required
                minLength={2}
                maxLength={32}
                className="min-w-0 flex-1 bg-transparent font-mono text-lg text-white outline-none placeholder:text-white/25"
                autoComplete="off"
                spellCheck={false}
              />
              <span className="font-mono text-sm text-white/40">.grid</span>
            </div>
            <p className="mt-2 min-h-[1.25rem] font-mono text-xs">
              {checking && (
                <span className="text-white/35">Checking…</span>
              )}
              {!checking && name.length >= 2 && avail?.available && (
                <span className="text-emerald-300/90">Available</span>
              )}
              {!checking && name.length >= 2 && avail && !avail.available && (
                <span className="text-amber-200/90">
                  {avail.reason === "taken"
                    ? "Taken"
                    : avail.reason ?? "Unavailable"}
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="font-mono text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
              Display label
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, 32))}
              placeholder="Garage Node"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/40"
            />
          </div>

          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
              Register as (required)
            </p>
            <p className="mt-1 text-xs text-white/40">
              To appear on{" "}
              <span className="font-mono text-white/60">registry.grid</span>{" "}
              you must register a <strong className="text-white/70">node</strong>{" "}
              and/or a <strong className="text-white/70">compute</strong>.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="flex flex-1 cursor-pointer items-start gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 has-[:checked]:border-white/40">
                <input
                  type="checkbox"
                  checked={asNode}
                  onChange={(e) => setAsNode(e.target.checked)}
                  className="mt-1 accent-white"
                />
                <span>
                  <span className="block text-sm text-white">Node</span>
                  <span className="mt-0.5 block text-xs text-white/40">
                    Mesh peer / miner presence on the registry
                  </span>
                </span>
              </label>
              <label className="flex flex-1 cursor-pointer items-start gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 has-[:checked]:border-white/40">
                <input
                  type="checkbox"
                  checked={asCompute}
                  onChange={(e) => setAsCompute(e.target.checked)}
                  className="mt-1 accent-white"
                />
                <span>
                  <span className="block text-sm text-white">Compute</span>
                  <span className="mt-0.5 block text-xs text-white/40">
                    Named capacity (grid launch / host work)
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
                Class
              </label>
              <select
                value={klass}
                onChange={(e) => setKlass(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
              >
                <option value="S">S · home</option>
                <option value="M">M · rack</option>
                <option value="L">L · datacenter</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
                Region
              </label>
              <input
                value={region}
                onChange={(e) =>
                  setRegion(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9_-]/g, "")
                      .slice(0, 16),
                  )
                }
                placeholder="NA-W"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-white outline-none placeholder:text-white/25 focus:border-white/40"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/55">
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-white/40 uppercase">
              Payment
            </p>
            <p className="mt-2">
              Public name registration is{" "}
              <strong className="text-white">${fee.toFixed(2)} USD</strong>,
              paid with <strong className="text-white">Cash App only</strong> to{" "}
              <span className="font-mono text-white">{cashtag}</span>.
            </p>
            <p className="mt-2 text-white/40">
              No cards, crypto, or other apps for this flow.
            </p>
          </div>

          <button
            type="submit"
            disabled={busy || !nameOk || (!asNode && !asCompute)}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Reserving…" : "Continue to Cash App"}
          </button>
        </form>
      )}

      {step === "passkey" && reg && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/15 bg-white/[0.03] p-6">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/40 uppercase">
              IdentityKey
            </p>
            <h3 className="mt-2 text-xl font-thin tracking-wide">
              Secure{" "}
              <span className="font-mono text-white/90">grid://{reg.name}.grid</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Create an <strong className="text-white/80">IdentityKey</strong> for
              this name. Use your device unlock (biometrics or PIN) or a hardware
              security key.
            </p>
          </div>

          {!identityKeySupported && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              This browser cannot create an IdentityKey. Continue with Cash App
              payment without one.
            </p>
          )}

          <button
            type="button"
            disabled={busy || !identityKeySupported}
            onClick={() => void onCreateIdentityKey()}
            className="btn-primary w-full disabled:opacity-40"
          >
            {busy ? "Waiting for authenticator…" : "Create IdentityKey"}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => setStep("pay")}
            className="btn-ghost w-full"
          >
            Skip IdentityKey — continue to Cash App
          </button>

          <p className="text-center text-xs text-white/30">
            IdentityKey proves device control. Cash App still handles the registry
            fee to {cashtag}.
          </p>
        </div>
      )}

      {step === "pay" && reg && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/15 bg-white/[0.03] p-6">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/40 uppercase">
              Reserved
              {identityKeyOk || reg.hasPasskey ? " · IdentityKey linked" : ""}
            </p>
            <p className="mt-2 font-mono text-2xl text-white">
              grid://{reg.name}.grid
            </p>
            <p className="mt-4 text-sm text-white/50">
              Pay{" "}
              <strong className="text-white">${fee.toFixed(2)}</strong> via Cash
              App to{" "}
              <strong className="font-mono text-white">{cashtag}</strong> with
              this exact note. Fee prevents abuse and funds human review
              (employment). Donations accepted at {cashtag} anytime.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white">
                {reg.paymentNote}
              </code>
              <button
                type="button"
                onClick={copyNote}
                className="btn-ghost px-3 py-2 text-[0.65rem]"
              >
                {copied ? "Copied" : "Copy note"}
              </button>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-white/50">
            {(instructions.length
              ? instructions
              : [
                  `Pay exactly $${fee.toFixed(2)} with Cash App only.`,
                  `Send to ${cashtag}.`,
                  `Note: ${reg.paymentNote}`,
                ]
            ).map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-white/25">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <a
            href={cashUrl ?? `https://cash.app/${cashtag.replace("$", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            Open Cash App · pay {cashtag}
          </a>

          <p className="text-center text-xs text-white/35">
            Cash App only · ${fee.toFixed(2)} · note required
          </p>

          <button
            type="button"
            onClick={() => setStep("confirm")}
            className="btn-ghost w-full"
          >
            I paid — continue
          </button>
        </div>
      )}

      {step === "confirm" && reg && (
        <form onSubmit={onConfirm} className="space-y-6">
          <p className="text-sm text-white/55">
            Confirm you sent{" "}
            <strong className="text-white">${fee.toFixed(2)}</strong> via Cash
            App to <span className="font-mono text-white">{cashtag}</span> with
            note{" "}
            <span className="font-mono text-white">{reg.paymentNote}</span>.
          </p>
          <div>
            <label className="font-mono text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
              Optional confirmation (Cash App activity note)
            </label>
            <input
              value={cashConfirm}
              onChange={(e) => setCashConfirm(e.target.value.slice(0, 64))}
              placeholder="e.g. paid from $yourcashtag"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/40"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full disabled:opacity-40"
          >
            {busy ? "Submitting…" : "Submit for review"}
          </button>
          <button
            type="button"
            onClick={() => setStep("pay")}
            className="btn-ghost w-full"
          >
            Back to payment
          </button>
        </form>
      )}

      {step === "done" && reg && (
        <div className="space-y-6 text-center">
          <p className="font-mono text-[0.65rem] tracking-[0.22em] text-emerald-300/80 uppercase">
            Pending review
          </p>
          <h3 className="text-2xl font-thin tracking-wide">
            <ScrambleText text={reg.name} />
            <span className="text-white/40">.grid</span>
          </h3>
          <p className="text-sm leading-relaxed text-white/50">
            Your public name is reserved while payment is verified. Once
            active, launch the compute and host:
          </p>
          <pre className="overflow-x-auto rounded-xl border border-white/15 bg-black/60 p-4 text-left font-mono text-xs text-white/70">
            {`grid launch ${reg.name} --public
grid host`}
          </pre>
          <a href="/#nodes" className="btn-ghost inline-flex">
            View live mesh
          </a>
        </div>
      )}
    </div>
  );
}

function stepOrder(s: Step): number {
  return { name: 0, passkey: 1, pay: 2, confirm: 3, done: 4 }[s];
}
