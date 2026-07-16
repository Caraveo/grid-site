"use client";

import { useMemo } from "react";
import type { PublicNode } from "@/lib/network";
import { shortId } from "@/lib/network";

type Props = {
  genesis: PublicNode;
  peers: PublicNode[];
};

type Point = { x: number; y: number; node: PublicNode };

const W = 640;
const H = 420;
const CX = W / 2;
const CY = H / 2;

function layout(genesis: PublicNode, peers: PublicNode[]): Point[] {
  const points: Point[] = [{ x: CX, y: CY, node: genesis }];
  const n = peers.length;
  if (n === 0) return points;

  const radius = Math.min(W, H) * 0.32;
  peers.forEach((peer, i) => {
    // Slight spiral so many peers don't perfectly overlap angles
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2 + (n > 8 ? i * 0.04 : 0);
    const r = radius + (i % 3) * 14;
    points.push({
      x: CX + Math.cos(angle) * r,
      y: CY + Math.sin(angle) * r,
      node: peer,
    });
  });
  return points;
}

function statusFill(status: PublicNode["status"], isGenesis: boolean) {
  if (isGenesis) return "#ffffff";
  switch (status) {
    case "online":
      return "rgba(255,255,255,0.92)";
    case "syncing":
      return "rgba(255,255,255,0.55)";
    case "idle":
      return "rgba(255,255,255,0.35)";
    default:
      return "rgba(255,255,255,0.18)";
  }
}

export function MeshGraph({ genesis, peers }: Props) {
  const points = useMemo(() => layout(genesis, peers), [genesis, peers]);
  const genesisPt = points[0];

  return (
    <div className="relative w-full overflow-hidden border border-white/10 bg-black">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative z-10 h-auto w-full"
        role="img"
        aria-label="GRID peer mesh around genesis node"
      >
        <defs>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
        </defs>

        {/* Links: every peer → genesis (star topology for Phase 0/1 tracking) */}
        {points.slice(1).map((p) => (
          <g key={`link-${p.node.id}`}>
            <line
              x1={genesisPt.x}
              y1={genesisPt.y}
              x2={p.x}
              y2={p.y}
              stroke="url(#link-grad)"
              strokeWidth={1}
              strokeOpacity={p.node.status === "offline" ? 0.15 : 0.55}
            />
            {/* Pulse packet along link */}
            {p.node.status !== "offline" && (
              <circle r={2.2} fill="#fff" opacity={0.85}>
                <animateMotion
                  dur={`${3.2 + (p.node.id.charCodeAt(0) % 5) * 0.35}s`}
                  repeatCount="indefinite"
                  path={`M ${genesisPt.x} ${genesisPt.y} L ${p.x} ${p.y}`}
                />
              </circle>
            )}
          </g>
        ))}

        {/* Peer↔peer faint mesh (visual only — not claiming full gossip yet) */}
        {peers.length >= 2 &&
          points.slice(1).map((a, i) => {
            const b = points[1 + ((i + 1) % peers.length)];
            return (
              <line
                key={`mesh-${a.node.id}-${b.node.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.75}
                strokeDasharray="3 5"
              />
            );
          })}

        {/* Nodes */}
        {points.map((p) => {
          const isGenesis = p.node.role === "genesis";
          const r = isGenesis ? 14 : 7;
          return (
            <g key={p.node.id} transform={`translate(${p.x}, ${p.y})`}>
              {isGenesis && (
                <>
                  <circle
                    r={28}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={1}
                  >
                    <animate
                      attributeName="r"
                      values="24;32;24"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0.15;0.6"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    r={20}
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={1}
                  />
                </>
              )}
              <circle
                r={r}
                fill={statusFill(p.node.status, isGenesis)}
                filter={isGenesis ? "url(#soft-glow)" : undefined}
              />
              {isGenesis && (
                <rect
                  x={-3.5}
                  y={-3.5}
                  width={7}
                  height={7}
                  fill="#000"
                  transform="rotate(45)"
                />
              )}
              <text
                y={isGenesis ? 36 : 18}
                textAnchor="middle"
                fill="rgba(255,255,255,0.75)"
                fontSize={isGenesis ? 10 : 8}
                fontFamily="ui-monospace, monospace"
                letterSpacing="0.12em"
              >
                {isGenesis ? "GENESIS" : shortId(p.node.id)}
              </text>
              {!isGenesis && (
                <text
                  y={28}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.35)"
                  fontSize={7}
                  fontFamily="ui-monospace, monospace"
                >
                  {p.node.class} · {p.node.region}
                </text>
              )}
            </g>
          );
        })}

        {/* Empty state hint */}
        {peers.length === 0 && (
          <text
            x={CX}
            y={CY + 72}
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize={11}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Awaiting first peer · Phase 0 / 1 mesh
          </text>
        )}
      </svg>

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-[0.6rem] tracking-[0.16em] text-white/35 uppercase">
        <span>Star topology · Genesis tracks peers</span>
        <span>No IPs · No hostnames</span>
      </div>
    </div>
  );
}
