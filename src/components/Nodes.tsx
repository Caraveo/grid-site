"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WorldNodeMap } from "./WorldNodeMap";
import {
  relativeTime,
  shortId,
  type PublicNode,
} from "@/lib/network";
import { ScrambleText } from "./ScrambleText";

type MeshResponse = {
  phase: string;
  updatedAt: string;
  genesis: PublicNode;
  nodes: PublicNode[];
  peers: PublicNode[];
  recentPings: Array<{
    id: string;
    label: string;
    lat: number;
    lng: number;
    at: string;
    isNew: boolean;
  }>;
  stats: { total: number; online: number; peers: number };
};

type Toast = {
  id: string;
  title: string;
  body: string;
  born: number;
};

const POLL_MS = 4000;

function statusDot(status: PublicNode["status"]) {
  const map = {
    online: "bg-white",
    syncing: "bg-white/60 animate-pulse",
    idle: "bg-white/35",
    offline: "bg-white/15",
  } as const;
  return map[status];
}

const initialGenesis: PublicNode = {
  id: "genesis",
  label: "GENESIS",
  class: "L",
  region: "—",
  status: "offline",
  role: "genesis",
};

export function Nodes() {
  const [mesh, setMesh] = useState<MeshResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [burstIds, setBurstIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const knownRef = useRef<Set<string>>(new Set());
  const primedRef = useRef(false);

  const pushToast = useCallback((title: string, body: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t.slice(-3), { id, title, body, born: Date.now() }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5200);
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`/api/mesh?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Mesh ${res.status}`);
        const data = (await res.json()) as MeshResponse;

        // Celebrate brand-new peers after first successful load
        if (primedRef.current) {
          const fresh: string[] = [];
          for (const p of data.peers ?? []) {
            if (!knownRef.current.has(p.id)) {
              knownRef.current.add(p.id);
              fresh.push(p.id);
              pushToast(
                "You're a node",
                `${p.label} joined the mesh · ${p.region}`,
              );
            }
          }
          for (const rp of data.recentPings ?? []) {
            if (rp.isNew && !knownRef.current.has(rp.id)) {
              knownRef.current.add(rp.id);
              if (!fresh.includes(rp.id)) fresh.push(rp.id);
            }
          }
          if (fresh.length) {
            setBurstIds((b) => [...new Set([...b, ...fresh])]);
          }
        } else {
          for (const p of data.peers ?? []) knownRef.current.add(p.id);
          for (const n of data.nodes ?? []) knownRef.current.add(n.id);
          primedRef.current = true;
        }

        setMesh(data);
      } catch {
        // Keep last good mesh snapshot; UI stays calm
      } finally {
        setLoading(false);
      }
    },
    [pushToast],
  );

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const genesis = mesh?.genesis ?? initialGenesis;
  const nodes = mesh?.nodes ?? [];
  const peers = mesh?.peers ?? [];
  const stats = mesh?.stats ?? { total: 0, online: 0, peers: 0 };

  return (
    <section
      id="network"
      className="relative overflow-hidden border-t border-white/10 px-5 py-28 sm:py-36"
    >
      <span id="nodes" className="absolute -top-20" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_20%,rgba(255,255,255,0.04)_0%,transparent_60%)]" />

      {/* Celebration toasts */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-[min(100%,20rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto border border-white/25 bg-black/90 px-4 py-3 shadow-[0_0_40px_rgba(255,255,255,0.08)] backdrop-blur-md animate-fade-up"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <p className="text-[0.65rem] font-semibold tracking-[0.22em] uppercase">
                {t.title}
              </p>
            </div>
            <p className="mt-1.5 text-sm text-white/70">{t.body}</p>
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">
              <ScrambleText text="The living mesh" />
            </p>
            <h2 className="section-title mt-5">
              <ScrambleText text="Ping" /> the
              <br />
              <ScrambleText text="planet." />
            </h2>
            <p className="section-body mt-6">
              When a machine joins, the world answers with light — a presence.
              A quiet pulse that says{" "}
              <span className="text-white">&ldquo;Hey! — I&apos;m a node.&rdquo;</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-6 lg:justify-end">
            {[
              { v: stats.total, l: "On mesh" },
              { v: stats.peers, l: "Peers" },
              { v: stats.online, l: "Online" },
              { v: `P${mesh?.phase ?? "0"}`, l: "Phase" },
            ].map((s) => (
              <div key={s.l} className="min-w-[4.5rem]">
                <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {loading && s.l !== "Phase" && !mesh ? "—" : s.v}
                </div>
                <div className="mt-1 text-[0.65rem] tracking-[0.18em] text-white/40 uppercase">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <WorldNodeMap
              genesis={genesis}
              nodes={nodes}
              burstIds={burstIds}
              onBurstDone={(id) =>
                setBurstIds((b) => b.filter((x) => x !== id))
              }
            />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="panel p-6">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] tracking-[0.22em] text-white/40 uppercase">
                  Genesis
                </span>
                <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.14em] text-white/70 uppercase">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusDot(genesis.status)}`}
                  />
                  {genesis.status}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                <ScrambleText text={genesis.label} />
              </h3>
              <p className="mt-2 text-sm text-white/45">
                The first light. Every pulse on this map begins here —
                one home for the mesh while the network is still young.
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
                <div>
                  <dt className="text-[0.6rem] tracking-[0.16em] text-white/35 uppercase">
                    Class
                  </dt>
                  <dd className="mt-1 font-mono">{genesis.class}</dd>
                </div>
                <div>
                  <dt className="text-[0.6rem] tracking-[0.16em] text-white/35 uppercase">
                    Region
                  </dt>
                  <dd className="mt-1 font-mono">{genesis.region}</dd>
                </div>
                <div>
                  <dt className="text-[0.6rem] tracking-[0.16em] text-white/35 uppercase">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm">Home beacon</dd>
                </div>
                <div>
                  <dt className="text-[0.6rem] tracking-[0.16em] text-white/35 uppercase">
                    Signal
                  </dt>
                  <dd className="mt-1 text-sm capitalize">{genesis.status}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Peer table */}
        <div className="mt-8 overflow-hidden border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="text-[0.7rem] font-semibold tracking-[0.22em] uppercase">
              Who is here
            </h3>
            <button
              type="button"
              onClick={() => load()}
              className="text-[0.65rem] tracking-[0.16em] text-white/45 uppercase transition hover:text-white"
            >
              Refresh
            </button>
          </div>

          {peers.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm text-white/50">
                The sky is quiet. Genesis holds the first light —
                waiting for the next spark to answer.
              </p>
              <p className="mt-3 text-xs tracking-[0.14em] text-white/30 uppercase">
                Run a node. Become a pulse.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[0.6rem] tracking-[0.18em] text-white/35 uppercase">
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Signal</th>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Class</th>
                    <th className="px-5 py-3 font-medium">Horizon</th>
                    <th className="px-5 py-3 font-medium">Last breath</th>
                  </tr>
                </thead>
                <tbody>
                  {peers.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2 capitalize text-white/70">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusDot(p.status)}`}
                          />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs tracking-wider">
                        {shortId(p.id)}
                      </td>
                      <td className="px-5 py-3.5 text-white/80">{p.label}</td>
                      <td className="px-5 py-3.5 font-mono">{p.class}</td>
                      <td className="px-5 py-3.5 text-white/55">
                        {p.region}
                      </td>
                      <td className="px-5 py-3.5 text-white/40">
                        {relativeTime(p.lastSeen ?? p.joinedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
