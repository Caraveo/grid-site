"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ServiceState = "live" | "affected" | "building" | "down" | "unavailable";

type ServiceResult = {
  id: string;
  name: string;
  description: string;
  category: "Network" | "Public" | "Apps" | "Markets";
  href?: string;
  state: ServiceState;
  detail: string;
  latencyMs: number | null;
  endpoint: string | null;
  checkedAt: string;
};

type StatusPayload = {
  checkedAt: string;
  counts: Record<ServiceState, number>;
  services: ServiceResult[];
};

const statePresentation: Record<
  ServiceState,
  { label: string; dot: string; border: string; wash: string; text: string }
> = {
  live: {
    label: "Live",
    dot: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.75)]",
    border: "border-emerald-400/30",
    wash: "bg-emerald-400/[0.045]",
    text: "text-emerald-300",
  },
  affected: {
    label: "Affected",
    dot: "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,.65)]",
    border: "border-orange-400/35",
    wash: "bg-orange-400/[0.05]",
    text: "text-orange-300",
  },
  building: {
    label: "Building",
    dot: "bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,.55)]",
    border: "border-yellow-300/30",
    wash: "bg-yellow-300/[0.04]",
    text: "text-yellow-200",
  },
  down: {
    label: "Down",
    dot: "bg-red-500 shadow-[0_0_14px_rgba(239,68,68,.7)]",
    border: "border-red-500/35",
    wash: "bg-red-500/[0.055]",
    text: "text-red-300",
  },
  unavailable: {
    label: "Not available",
    dot: "border border-white/20 bg-black",
    border: "border-white/10",
    wash: "bg-black/25",
    text: "text-white/35",
  },
};

const states: ServiceState[] = [
  "live",
  "affected",
  "building",
  "down",
  "unavailable",
];

function timeLabel(iso?: string) {
  if (!iso) return "Awaiting first check";
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ServiceStatusBoard() {
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/services/status-v1", { cache: "no-store" });
      if (!response.ok) throw new Error(`Status API returned ${response.status}`);
      setPayload((await response.json()) as StatusPayload);
      setError("");
    } catch {
      setError("Live service checks are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void refresh());
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const overall = useMemo(() => {
    if (!payload) return "Checking services";
    if (payload.counts.down > 0) return "Service interruption detected";
    if (payload.counts.affected > 0) return "Some services are affected";
    if (payload.counts.live > 0) return "Public systems responding";
    return "No live checks available";
  }, [payload]);

  return (
    <section className="border-t border-foreground/10 px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-7 border-b border-foreground/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Live service checks</p>
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-6xl">
              Every public GRID surface.
            </h2>
            <div className="mt-6 flex items-center gap-3">
              <span
                className={`size-2.5 rounded-full ${
                  payload?.counts.down
                    ? statePresentation.down.dot
                    : payload?.counts.affected
                      ? statePresentation.affected.dot
                      : statePresentation.live.dot
                }`}
              />
              <p className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
                {loading && !payload ? "Running public checks" : overall}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted uppercase">
              Checked {timeLabel(payload?.checkedAt)} · refreshes every minute
            </p>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="btn-ghost min-w-32 text-xs disabled:cursor-wait disabled:opacity-50"
            >
              {loading ? "Checking…" : "Check now"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-6 border border-orange-400/30 bg-orange-400/[0.05] px-5 py-4 text-sm text-orange-200">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid grid-cols-2 gap-px bg-foreground/10 sm:grid-cols-5">
          {states.map((state) => {
            const presentation = statePresentation[state];
            return (
              <div key={state} className="bg-background p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${presentation.dot}`} />
                  <p className={`font-mono text-[0.62rem] tracking-[0.14em] uppercase ${presentation.text}`}>
                    {presentation.label}
                  </p>
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
                  {payload?.counts[state] ?? "—"}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
          aria-live="polite"
          aria-busy={loading}
        >
          {(payload?.services ?? []).map((service) => {
            const presentation = statePresentation[service.state];
            const body = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.58rem] tracking-[0.16em] text-muted uppercase">
                      {service.category}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                      {service.name}
                    </h3>
                  </div>
                  <span className={`flex shrink-0 items-center gap-2 font-mono text-[0.6rem] tracking-[0.12em] uppercase ${presentation.text}`}>
                    <span className={`size-2 rounded-full ${presentation.dot}`} />
                    {presentation.label}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">{service.description}</p>
                <p className="mt-3 text-xs leading-5 text-foreground/55">{service.detail}</p>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-foreground/10 pt-4 font-mono text-[0.58rem] tracking-[0.08em] text-muted uppercase">
                  <span className="min-w-0 truncate">
                    {service.endpoint ?? "No public endpoint"}
                  </span>
                  <span className="shrink-0">
                    {service.latencyMs == null ? "—" : `${service.latencyMs} ms`}
                  </span>
                </div>
              </>
            );

            return service.href ? (
              <a
                key={service.id}
                href={service.href}
                className={`block min-h-56 border p-5 transition hover:-translate-y-0.5 hover:border-foreground/35 ${presentation.border} ${presentation.wash}`}
              >
                {body}
              </a>
            ) : (
              <article
                key={service.id}
                className={`min-h-56 border p-5 ${presentation.border} ${presentation.wash}`}
              >
                {body}
              </article>
            );
          })}

          {!payload &&
            Array.from({ length: 9 }, (_, index) => (
              <div
                key={index}
                className="min-h-56 animate-pulse border border-foreground/10 bg-foreground/[0.025] p-5"
              >
                <div className="h-3 w-20 bg-foreground/10" />
                <div className="mt-5 h-6 w-36 bg-foreground/10" />
                <div className="mt-6 h-3 w-full bg-foreground/10" />
                <div className="mt-2 h-3 w-2/3 bg-foreground/10" />
              </div>
            ))}
        </div>

        <p className="mt-8 max-w-4xl text-xs leading-6 text-muted">
          Live checks confirm that a public endpoint responds; they do not certify
          feature completeness, custody safety, decentralization, or authorization for
          real-value use. “Building” means the surface is intentionally not launched.
          “Not available” means no public production endpoint exists.
        </p>
      </div>
    </section>
  );
}
