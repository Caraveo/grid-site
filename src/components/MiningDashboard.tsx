"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Reward = {
  jobId: string;
  amountGrid: number;
  status: string;
  transactionSignature: string | null;
  receiptSignature: string;
  createdAt: string;
};

type MinerData = {
  wallet: string;
  totals: { issuedGrid: number; pendingGrid: number; earnedGrid: number };
  quota: { usedGrid: number; limitGrid: number; remainingGrid: number; resetsAt: number };
  rewards: Reward[];
};

type StatusData = {
  ok: boolean;
  paused: boolean;
  pendingRewards: number;
  incidents: Array<{ id: number; message: string }>;
};

const API = "https://coordinator.grid-compute.com";
const ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function MiningDashboard() {
  const [wallet, setWallet] = useState("");
  const [query, setQuery] = useState("");
  const [miner, setMiner] = useState<MinerData | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh(address = query) {
    const statusRequest = fetch(`${API}/v1/status`, { cache: "no-store" }).then((r) => r.json());
    if (!address) {
      setStatus(await statusRequest);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [nextStatus, response] = await Promise.all([
        statusRequest,
        fetch(`${API}/v1/miners/${encodeURIComponent(address)}`, { cache: "no-store" }),
      ]);
      if (!response.ok) throw new Error("That does not look like a Solana wallet address.");
      setStatus(nextStatus);
      setMiner(await response.json());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load miner activity.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("grid-miner-wallet") || "";
    queueMicrotask(() => {
      setWallet(saved);
      setQuery(saved);
      void refresh(saved);
    });
    const timer = window.setInterval(() => void refresh(saved), 30_000);
    return () => window.clearInterval(timer);
    // Initial dashboard subscription is intentionally pinned to the saved wallet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const address = wallet.trim();
    if (!ADDRESS.test(address)) {
      setError("Enter a valid Solana wallet address.");
      return;
    }
    window.localStorage.setItem("grid-miner-wallet", address);
    setQuery(address);
    void refresh(address);
  }

  const reset = useMemo(() => {
    if (!miner) return "—";
    return new Date(miner.quota.resetsAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [miner]);

  return (
    <div className="space-y-8">
      <div className="panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
              Coordinator
            </p>
            <p className="mt-2 text-lg text-foreground">
              {status?.paused ? "Mining paused" : status?.ok ? "Operational" : "Checking network…"}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 font-mono text-xs ${
            status?.paused
              ? "border-red-500/40 text-red-500"
              : "border-emerald-500/40 text-emerald-500"
          }`}>
            {status?.paused ? "PAUSED" : "DEVNET LIVE"}
          </span>
        </div>
        {status?.incidents?.length ? (
          <p className="mt-4 text-sm text-amber-500">{status.incidents[0].message}</p>
        ) : null}
      </div>

      <form onSubmit={submit} className="panel p-6 sm:p-8">
        <label htmlFor="miner-wallet" className="font-mono text-xs tracking-wider text-muted uppercase">
          Solana reward wallet
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="miner-wallet"
            value={wallet}
            onChange={(event) => setWallet(event.target.value)}
            placeholder="Paste your Solana address"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-xl border border-border bg-transparent px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-foreground"
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? "Loading…" : "View activity"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <p className="mt-3 text-xs leading-relaxed text-muted">
          This is read-only. The dashboard never asks for a seed phrase or private key.
        </p>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Earned", miner ? `${miner.totals.earnedGrid.toLocaleString()} GRID` : "—"],
          ["Issued", miner ? `${miner.totals.issuedGrid.toLocaleString()} GRID` : "—"],
          ["Pending", miner ? `${miner.totals.pendingGrid.toLocaleString()} GRID` : "—"],
          ["Hourly room", miner ? `${miner.quota.remainingGrid.toLocaleString()} GRID` : "—"],
        ].map(([label, value]) => (
          <div key={label} className="panel p-5">
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">{label}</p>
            <p className="mt-3 text-xl font-light text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {miner ? (
        <div className="panel overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-xl font-light text-foreground">Verified reward receipts</h2>
            <p className="mt-1 text-xs text-muted">
              Wallet quota resets at {reset}. Transactions link to Solana devnet.
            </p>
          </div>
          <div className="divide-y divide-border">
            {miner.rewards.length ? miner.rewards.map((reward) => (
              <div key={reward.jobId} className="grid gap-2 px-6 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-foreground">{reward.jobId}</p>
                  <p className="mt-1 text-xs text-muted">{new Date(reward.createdAt).toLocaleString()}</p>
                </div>
                <p className="font-mono text-xs text-muted">{reward.status.toUpperCase()}</p>
                {reward.transactionSignature ? (
                  <a
                    href={`https://explorer.solana.com/tx/${reward.transactionSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-foreground underline-offset-4 hover:underline"
                  >
                    {reward.amountGrid} GRID ↗
                  </a>
                ) : (
                  <p className="font-mono text-xs text-foreground">{reward.amountGrid} GRID</p>
                )}
              </div>
            )) : (
              <p className="px-6 py-10 text-sm text-muted">No verified rewards for this wallet yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
