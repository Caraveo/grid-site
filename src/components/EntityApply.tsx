"use client";

import { FormEvent, useEffect, useState } from "react";

type Fees = {
  key: number;
  verified: number;
  cashtag: string;
};

type Started = {
  id: string;
  tier: string;
  realm: string;
  feeUsd: number;
  paymentNote: string;
  cashAppUrl: string;
  cashtag: string;
  instructions: string[];
  gpId?: string;
};

export function EntityApply() {
  const [fees, setFees] = useState<Fees | null>(null);
  const [tier, setTier] = useState<"key" | "verified">("key");
  const [realm, setRealm] = useState("");
  const [gpId, setGpId] = useState("");
  const [pubkeyHex, setPubkeyHex] = useState("");
  const [entityName, setEntityName] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState<Started | null>(null);
  const [confirmId, setConfirmId] = useState("");
  const [cashConfirm, setCashConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/registry/entity", { cache: "no-store" });
        const data = await res.json();
        if (data.ok && data.fees) setFees(data.fees);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function onStart(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/registry/entity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "start",
          tier,
          realm,
          gpId: gpId.trim().toLowerCase(),
          pubkeyHex: pubkeyHex.trim().toLowerCase(),
          nodeId: nodeId || undefined,
          entityName: tier === "verified" ? entityName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to start");
        return;
      }
      setStarted({
        id: data.application.id,
        tier: data.application.tier,
        realm: data.application.realm,
        feeUsd: data.feeUsd,
        paymentNote: data.application.paymentNote,
        cashAppUrl: data.cashAppUrl,
        cashtag: data.cashtag,
        instructions: data.instructions ?? [],
        gpId: data.application.gpId,
      });
      setConfirmId(data.application.id);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/registry/entity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          id: confirmId,
          cashConfirm: cashConfirm || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Confirm failed");
        return;
      }
      setMsg(
        `Payment marked — status ${data.application.status}. Wait for admin approval.`,
      );
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const fee = fees
    ? tier === "key"
      ? fees.key
      : fees.verified
    : tier === "key"
      ? 300
      : 10000;

  return (
    <div className="mt-10 space-y-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setTier("key")}
          className={`rounded-2xl border p-5 text-left transition ${
            tier === "key"
              ? "border-white bg-white/[0.06]"
              : "border-white/15 hover:border-white/30"
          }`}
        >
          <p className="font-mono text-[0.65rem] tracking-wider text-amber-200/80 uppercase">
            [Key]
          </p>
          <p className="mt-2 text-xl font-thin">Security feature</p>
          <p className="mt-2 font-mono text-sm text-white/50">
            ${fee === fees?.key || tier === "key" ? (fees?.key ?? 300).toFixed(0) : "300"}{" "}
            · Cash App
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/45">
            Permanent security credential for your realm. Shown as a Key mark in
            Mesh when active — not advertised on the public marketing site.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setTier("verified")}
          className={`rounded-2xl border p-5 text-left transition ${
            tier === "verified"
              ? "border-white bg-white/[0.06]"
              : "border-white/15 hover:border-white/30"
          }`}
        >
          <p className="font-mono text-[0.65rem] tracking-wider text-sky-200/80 uppercase">
            [Verified]
          </p>
          <p className="mt-2 text-xl font-thin">Verified Entity</p>
          <p className="mt-2 font-mono text-sm text-white/50">
            ${(fees?.verified ?? 10000).toLocaleString()} · Cash App
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/45">
            Organization verification after human review. Includes Key-level
            security marking.
          </p>
        </button>
      </div>

      <form onSubmit={onStart} className="space-y-4 rounded-2xl border border-white/10 p-6">
        <p className="font-mono text-[0.65rem] tracking-wider text-white/40 uppercase">
          Apply · ${fee.toLocaleString()}
        </p>
        <label className="block text-sm text-white/60">
          Realm (registered name)
          <input
            required
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            placeholder="garage"
            className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-white/40"
          />
        </label>
        <label className="block text-sm text-white/60">
          Identity id (128 hex from CLI)
          <input
            required
            value={gpId}
            onChange={(e) => setGpId(e.target.value)}
            placeholder="from grid claim / grid gp id"
            className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-xs text-white outline-none focus:border-white/40"
          />
        </label>
        <label className="block text-sm text-white/60">
          Operator public key (64 hex)
          <input
            required
            value={pubkeyHex}
            onChange={(e) => setPubkeyHex(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-xs text-white outline-none focus:border-white/40"
          />
        </label>
        <label className="block text-sm text-white/60">
          Node id (optional)
          <input
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-white/40"
          />
        </label>
        {tier === "verified" && (
          <label className="block text-sm text-white/60">
            Legal / organization name
            <input
              required
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
            />
          </label>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {busy ? "…" : "Start application"}
        </button>
      </form>

      {started && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6">
          <p className="font-mono text-xs text-emerald-100/90">
            Application {started.id}
          </p>
          <p className="mt-2 text-sm text-white/70">
            Send{" "}
            <span className="font-mono text-white">
              ${started.feeUsd.toFixed(2)}
            </span>{" "}
            to{" "}
            <span className="font-mono text-white">{started.cashtag}</span> with
            note{" "}
            <span className="font-mono text-white">{started.paymentNote}</span>
          </p>
          <a
            href={started.cashAppUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Open Cash App
          </a>
          <ul className="mt-4 list-inside list-disc text-xs text-white/45">
            {started.instructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <form
        onSubmit={onConfirm}
        className="space-y-3 rounded-2xl border border-white/10 p-6"
      >
        <p className="font-mono text-[0.65rem] tracking-wider text-white/40 uppercase">
          After you paid
        </p>
        <label className="block text-sm text-white/60">
          Application id
          <input
            required
            value={confirmId}
            onChange={(e) => setConfirmId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-white/40"
          />
        </label>
        <label className="block text-sm text-white/60">
          Cash App confirmation (optional)
          <input
            value={cashConfirm}
            onChange={(e) => setCashConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
        >
          I paid — submit for review
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      {msg && (
        <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {msg}
        </p>
      )}

      <p className="text-xs leading-relaxed text-white/30">
        Use <span className="font-mono">grid claim</span> and{" "}
        <span className="font-mono">grid gp id &lt;realm&gt;</span> for identity
        fields. Network identifiers are never collected on this form.
      </p>
    </div>
  );
}
