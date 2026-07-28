"use client";

import { useCallback, useEffect, useState } from "react";

type Node = {
  id: string;
  label: string;
  class: string;
  region: string;
  status: string;
  role: string;
  lastSeen?: string;
  lat?: number;
  lng?: number;
};

type Block = {
  height: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  stateRoot: string;
  transactions: number;
  settlements: number;
};

type ExplorerData = {
  checkedAt: string;
  endpoints: Record<string, string>;
  health: { genesis: boolean; coordinator: boolean; mesh: boolean };
  genesis: {
    ok?: boolean;
    epoch?: number;
    tracked?: number;
    banned?: number;
    chain?: {
      id: string;
      height: number;
      tipHash: string;
      leaderPubkey: string;
      maxSupply: number;
      blocks: number;
    } | null;
  } | null;
  chain: {
    chainId: string;
    leaderPubkey: string;
    maxSupply: number;
    height: number;
    tipHash: string;
    recoveryKeys: number;
    blocks: Block[];
  } | null;
  coordinator: {
    paused: boolean;
    jobs: { total: number; queued: number; verified: number; rejected: number };
    nodes: { total: number; online: number };
    rewards: {
      pending: number;
      issued: number;
      issuedGrid: number;
      hourlyCapGrid: number;
      rewardPerJobGrid: number;
    };
  } | null;
  status: {
    ok: boolean;
    paused: boolean;
    pendingRewards: number;
    checkedAt: string;
    incidents: Array<{ id: number; message: string }>;
  } | null;
  settlement: {
    chainId: string | null;
    height: number;
    tipHash: string | null;
    pendingSettlements: number;
    includedSettlements: number;
    lastBlockAt: number | null;
  } | null;
  mesh: {
    phase: string;
    updatedAt: string;
    nodes: Node[];
    stats: { total: number; online: number; peers: number };
  };
};

const short = (value?: string | null, size = 10) =>
  value ? `${value.slice(0, size)}…${value.slice(-6)}` : "—";

function age(value: string | number | null | undefined, referenceTime: number) {
  if (!value) return "never";
  const time = typeof value === "number" ? value : Date.parse(value);
  if (!Number.isFinite(time)) return "unknown";
  const seconds = Math.max(0, Math.floor((referenceTime - time) / 1_000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3_600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

function StatusDot({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-block size-2 rounded-full ${
        live ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" : "bg-red-400"
      }`}
    />
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="panel min-w-0 p-5">
      <p className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">{label}</p>
      <p className="mt-3 truncate text-2xl font-light text-foreground">{value}</p>
      {detail ? <p className="mt-2 truncate font-mono text-[0.68rem] text-dim">{detail}</p> : null}
    </div>
  );
}

export function ExplorerDashboard() {
  const [data, setData] = useState<ExplorerData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/explorer", { cache: "no-store" });
      if (!response.ok) throw new Error(`Explorer API returned ${response.status}`);
      setData((await response.json()) as ExplorerData);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not refresh network telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void refresh());
    const timer = window.setInterval(() => void refresh(), 10_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const nodes = data?.mesh.nodes ?? [];
  const sampleTime = data ? Date.parse(data.checkedAt) : 0;
  const activeNodes = nodes.filter((node) => {
    if (node.role === "genesis") return data?.health.genesis;
    return node.lastSeen ? sampleTime - Date.parse(node.lastSeen) < 60_000 : false;
  });
  const jobs = data?.coordinator?.jobs;
  const rewards = data?.coordinator?.rewards;
  const chainId = data?.chain?.chainId ?? data?.genesis?.chain?.id;
  const chainHeight = data?.chain?.height ?? data?.genesis?.chain?.height;
  const chainTipHash = data?.chain?.tipHash ?? data?.genesis?.chain?.tipHash;
  const chainLeader = data?.chain?.leaderPubkey ?? data?.genesis?.chain?.leaderPubkey;
  const chainMaxSupply = data?.chain?.maxSupply ?? data?.genesis?.chain?.maxSupply;
  const chainBlockCount = data?.chain?.blocks.length ?? data?.genesis?.chain?.blocks ?? 0;

  return (
    <div className="space-y-8">
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-6 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <StatusDot live={Boolean(data?.health.genesis && data?.health.coordinator)} />
              <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
                {loading ? "Connecting" : error ? "Telemetry degraded" : "Network telemetry live"}
              </p>
            </div>
            <p className="mt-3 text-sm text-muted">
              Auto-refreshes every 10 seconds · last sample {data ? age(data.checkedAt, sampleTime) : "—"}
            </p>
          </div>
          <button type="button" onClick={() => void refresh()} className="btn-ghost text-xs">
            Refresh now
          </button>
        </div>
        {error ? <p className="border-b border-border px-6 py-3 text-sm text-amber-500">{error}</p> : null}
        <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Genesis", data?.health.genesis ?? false, data?.endpoints.genesisP2p],
            ["Coordinator", data?.health.coordinator ?? false, data?.endpoints.coordinator],
            ["Ping mesh", data?.health.mesh ?? false, data?.endpoints.mesh],
          ].map(([label, live, endpoint]) => (
            <div key={String(label)} className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-sm text-foreground">{String(label)}</p>
                <p className="mt-1 truncate font-mono text-[0.66rem] text-dim">{String(endpoint ?? "—")}</p>
              </div>
              <span className="flex items-center gap-2 font-mono text-[0.65rem] text-muted uppercase">
                <StatusDot live={Boolean(live)} />
                {live ? "live" : "down"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Consensus anchor</p>
            <h2 className="mt-2 text-2xl font-light">Genesis + signed chain</h2>
          </div>
          <span className="font-mono text-[0.65rem] text-muted">PHASE {data?.mesh.phase ?? "—"}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Block height" value={chainHeight ?? "—"} detail={`${chainBlockCount} stored blocks`} />
          <Metric label="Chain ID" value={short(chainId, 12)} detail={chainId ?? "awaiting Genesis"} />
          <Metric label="Settlements" value={data?.settlement?.includedSettlements ?? 0} detail={`${data?.settlement?.pendingSettlements ?? 0} pending`} />
          <Metric label="Supply ceiling" value={chainMaxSupply ? `${(chainMaxSupply / 1_000_000_000).toFixed(0)}B GRID` : "10B GRID"} detail="hard protocol cap" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="panel p-6">
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">Trust anchor</p>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Leader public key", chainLeader],
                ["Tip hash", chainTipHash],
                ["Last signed block", data?.settlement?.lastBlockAt ? age(data.settlement.lastBlockAt, sampleTime) : "genesis only"],
                ["Recovery policy", data?.chain ? `${data.chain.recoveryKeys}-key recovery set` : "2-key recovery set"],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="break-all font-mono text-xs text-foreground">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="panel p-6">
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">Genesis policy</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div><p className="text-2xl font-light">{data?.genesis?.epoch ?? 0}</p><p className="mt-1 text-xs text-muted">epoch</p></div>
              <div><p className="text-2xl font-light">{data?.genesis?.tracked ?? 0}</p><p className="mt-1 text-xs text-muted">tracked</p></div>
              <div><p className="text-2xl font-light">{data?.genesis?.banned ?? 0}</p><p className="mt-1 text-xs text-muted">banned</p></div>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              Peers pin the public leader key and independently verify signed policy snapshots and blocks.
            </p>
          </div>
        </div>
      </section>

      <section>
        <p className="section-label">Compute settlement</p>
        <h2 className="mt-2 text-2xl font-light">Coordinator activity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Jobs submitted" value={jobs?.total ?? 0} detail={`${jobs?.queued ?? 0} queued`} />
          <Metric label="Verified jobs" value={jobs?.verified ?? 0} detail={`${jobs?.rejected ?? 0} rejected`} />
          <Metric label="Online miners" value={data?.coordinator?.nodes.online ?? 0} detail={`${data?.coordinator?.nodes.total ?? 0} known`} />
          <Metric label="GRID issued" value={(rewards?.issuedGrid ?? 0).toLocaleString()} detail={`${rewards?.pending ?? 0} rewards pending`} />
        </div>
        <div className="mt-4 panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">Emission controller</p>
            <p className="font-mono text-xs text-muted">
              {rewards?.rewardPerJobGrid ?? 100} GRID/job · {(rewards?.hourlyCapGrid ?? 25_000).toLocaleString()} GRID/hour
            </p>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-700"
              style={{
                width: `${Math.min(100, ((rewards?.issuedGrid ?? 0) / Math.max(1, rewards?.hourlyCapGrid ?? 25_000)) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            Lifetime issued is shown against one hourly ceiling for scale; the controller enforces rolling hourly quotas independently.
          </p>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Ping + peer mesh</p>
            <h2 className="mt-2 text-2xl font-light">Public nodes</h2>
          </div>
          <p className="font-mono text-xs text-muted">
            {activeNodes.length} live now · {nodes.length} visible
          </p>
        </div>
        <div className="mt-4 panel relative h-64 overflow-hidden bg-[radial-gradient(circle_at_center,var(--surface-hover),transparent_70%)]">
          <div className="absolute inset-0 opacity-30 grid-bg" />
          {nodes.filter((node) => Number.isFinite(node.lat) && Number.isFinite(node.lng)).map((node) => {
            const left = ((Number(node.lng) + 180) / 360) * 100;
            const top = ((90 - Number(node.lat)) / 180) * 100;
            const live = activeNodes.some((active) => active.id === node.id);
            return (
              <div
                key={node.id}
                title={`${node.label} · ${node.region}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <span className={`block size-3 rounded-full border border-background ${live ? "bg-emerald-400" : "bg-dim"}`} />
                {node.role === "genesis" ? <span className="absolute inset-0 -m-2 animate-ping rounded-full border border-emerald-400/50" /> : null}
              </div>
            );
          })}
          <p className="absolute bottom-3 left-4 font-mono text-[0.6rem] text-dim">
            Coarse coordinates only · no public IP addresses
          </p>
        </div>
        <div className="mt-4 panel overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border px-5 py-3 font-mono text-[0.6rem] tracking-wider text-dim uppercase sm:grid-cols-[1.2fr_.7fr_.5fr_.5fr]">
            <span>Node</span><span className="hidden sm:block">Region</span><span>Class</span><span>Seen</span>
          </div>
          <div className="divide-y divide-border">
            {nodes.map((node) => {
              const live = activeNodes.some((active) => active.id === node.id);
              return (
                <div key={node.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 text-sm sm:grid-cols-[1.2fr_.7fr_.5fr_.5fr]">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-foreground"><StatusDot live={live} />{node.label}</p>
                    <p className="mt-1 truncate font-mono text-[0.65rem] text-dim">{node.id}</p>
                  </div>
                  <span className="hidden text-xs text-muted sm:block">{node.region}</span>
                  <span className="font-mono text-xs text-muted">{node.class}</span>
                  <span className="font-mono text-[0.65rem] text-muted">{node.role === "genesis" && live ? "now" : age(node.lastSeen, sampleTime)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <p className="section-label">Signed history</p>
        <h2 className="mt-2 text-2xl font-light">Latest blocks</h2>
        <div className="mt-4 panel overflow-hidden">
          {data?.chain?.blocks?.length ? (
            <div className="divide-y divide-border">
              {data.chain.blocks.map((block) => (
                <div key={block.hash} className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-[5rem_1fr_auto_auto] sm:items-center">
                  <p className="font-mono text-foreground">#{block.height}</p>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-foreground">{block.hash}</p>
                    <p className="mt-1 text-xs text-muted">{new Date(block.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="font-mono text-xs text-muted">{block.transactions} tx</p>
                  <p className="font-mono text-xs text-muted">{block.settlements} settlements</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-6 py-10 text-sm text-muted">Genesis block telemetry will appear when the signed service comes online.</p>
          )}
        </div>
      </section>
    </div>
  );
}
