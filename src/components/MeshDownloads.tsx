"use client";

import { useEffect, useMemo, useState } from "react";
import {
  detectMeshPlatform,
  getMeshDownload,
  MESH_DOWNLOADS,
  meshPlatformLabel,
  type MeshDownload,
  type MeshPlatformId,
} from "@/lib/downloads";

function PlatformIcon({ id }: { id: string }) {
  if (id.startsWith("mac")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M16.5 3.5c-.9.1-2 .7-2.6 1.5-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.6-1.3.6-.8 1.1-1.9.9-3zM18.2 8.2c-1.7-.1-3.1 1-3.9 1-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.5 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.2 3.2-2.4.6-.9 1.1-1.8 1.4-2.8-3.1-1.2-3.6-5.6-.5-7-.9-1.1-2.3-1.8-4.1-1.9z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (id === "linux") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3c-1.5 2-2.2 4-2.2 5.8 0 1.2.3 2.2.8 3.1-.8.4-1.4 1.3-1.4 2.4 0 .7.3 1.4.8 1.9-.5.4-.8 1.1-.8 1.8 0 1.3 1 2.3 2.3 2.3.5 0 1-.2 1.4-.4.5.9 1.4 1.5 2.5 1.5 1.5 0 2.7-1.2 2.7-2.7 0-.5-.1-1-.4-1.4.4-.4.7-1 .7-1.6 0-1-.6-1.9-1.5-2.3.4-.9.7-1.9.7-3 0-2.1-1-4.3-2.8-6.4-.4.9-1.1 1.6-2 2z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function Card({
  p,
  recommended,
}: {
  p: MeshDownload;
  recommended: boolean;
}) {
  return (
    <div
      className={`dl-card panel flex flex-col p-6 sm:p-7 transition ${
        recommended
          ? "border-foreground/30 bg-foreground/[0.04] dark:border-white/40 dark:bg-white/[0.06] ring-1 ring-foreground/10 dark:ring-white/20"
          : ""
      }`}
      data-recommended={recommended ? "true" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 text-foreground dark:text-white/80">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-foreground/[0.03] dark:bg-white/[0.04]">
            <PlatformIcon id={p.id} />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{p.name}</h3>
            <p className="text-sm text-muted">{p.arch}</p>
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[0.6rem] tracking-[0.12em] uppercase ${
            recommended
              ? "border-foreground bg-foreground text-background dark:border-white/50 dark:bg-white dark:text-black"
              : p.available
                ? "border-border text-muted"
                : "border-border/60 text-muted/60"
          }`}
        >
          {recommended ? "Best for you" : p.badge}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{p.note}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {p.available && p.primary ? (
          <a
            href={p.primary.href}
            download={p.primary.filename}
            className={
              recommended
                ? "btn-primary px-5 py-2.5 text-[0.65rem]"
                : "btn-ghost px-5 py-2.5 text-[0.65rem]"
            }
          >
            {p.primary.label}
          </a>
        ) : (
          <span className="btn-ghost cursor-default opacity-40 px-5 py-2.5 text-[0.65rem]">
            Coming soon
          </span>
        )}
        {p.available && p.secondary && (
          <a
            href={p.secondary.href}
            download={p.secondary.filename}
            className="text-[0.7rem] font-semibold tracking-[0.14em] text-muted uppercase transition hover:text-foreground"
          >
            {p.secondary.label} →
          </a>
        )}
      </div>
    </div>
  );
}

export function MeshDownloads() {
  const [bestId, setBestId] = useState<MeshPlatformId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await detectMeshPlatform();
      if (!cancelled) {
        setBestId(id);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const best = bestId ? getMeshDownload(bestId) : undefined;

  const ordered = useMemo(() => {
    if (!bestId) return MESH_DOWNLOADS;
    return [
      ...MESH_DOWNLOADS.filter((p) => p.id === bestId),
      ...MESH_DOWNLOADS.filter((p) => p.id !== bestId),
    ];
  }, [bestId]);

  return (
    <div id="mesh-downloads" className="mx-auto mt-14 max-w-5xl">
      {/* Smart primary CTA */}
      <div className="mb-8 border border-white/15 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/40 uppercase">
              {ready
                ? best
                  ? "Detected for this browser"
                  : "Pick your platform"
                : "Detecting platform…"}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {best ? (
                <>
                  Mesh for{" "}
                  <span className="text-white/70">
                    {meshPlatformLabel(best.id)}
                  </span>
                </>
              ) : (
                <>Download Mesh</>
              )}
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/45">
              {best
                ? "We picked the best build for your machine. Other platforms are still listed below."
                : "We couldn’t auto-detect your OS. Choose Mac, Linux, or Windows below."}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            {best?.available && best.primary ? (
              <>
                <a
                  href={best.primary.href}
                  download={best.primary.filename}
                  className="btn-primary min-w-[200px] text-center"
                >
                  Download Mesh
                </a>
                {best.secondary && (
                  <a
                    href={best.secondary.href}
                    download={best.secondary.filename}
                    className="text-center text-[0.7rem] font-semibold tracking-[0.14em] text-white/50 uppercase transition hover:text-white"
                  >
                    {best.secondary.label} →
                  </a>
                )}
              </>
            ) : (
              <a href="#mesh-platforms" className="btn-primary min-w-[200px] text-center">
                Browse platforms
              </a>
            )}
          </div>
        </div>
      </div>

      {/* All platforms — recommended first */}
      <div
        id="mesh-platforms"
        className="grid gap-4 sm:grid-cols-2"
      >
        {ordered.map((p) => (
          <Card key={p.id} p={p} recommended={ready && p.id === bestId} />
        ))}
      </div>
    </div>
  );
}
